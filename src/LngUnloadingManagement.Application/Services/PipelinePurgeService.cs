using LngUnloadingManagement.Application.DTOs;
using LngUnloadingManagement.Application.Exceptions;
using LngUnloadingManagement.Application.Interfaces;
using LngUnloadingManagement.Domain.Entities;
using LngUnloadingManagement.Domain.Enums;
using LngUnloadingManagement.Domain.Interfaces;

namespace LngUnloadingManagement.Application.Services;

public class PipelinePurgeService : IPipelinePurgeService
{
    private readonly IPipelinePurgeRepository _repository;
    private readonly IBerthPlanRepository _berthPlanRepository;

    public PipelinePurgeService(IPipelinePurgeRepository repository, IBerthPlanRepository berthPlanRepository)
    {
        _repository = repository;
        _berthPlanRepository = berthPlanRepository;
    }

    public async Task<IEnumerable<PipelinePurgeDto>> GetAllAsync()
    {
        var entities = await _repository.GetAllAsync();
        return entities.Select(MapToDto);
    }

    public async Task<PipelinePurgeDto?> GetByIdAsync(Guid id)
    {
        var entity = await _repository.GetByIdAsync(id);
        return entity == null ? null : MapToDto(entity);
    }

    public async Task<IEnumerable<PipelinePurgeDto>> GetByBerthPlanIdAsync(Guid berthPlanId)
    {
        var entities = await _repository.GetByBerthPlanIdAsync(berthPlanId);
        return entities.Select(MapToDto);
    }

    public async Task<PipelinePurgeDto> CreateAsync(CreatePipelinePurgeDto dto, string operatorName)
    {
        if (string.IsNullOrWhiteSpace(dto.PurgeNo))
            throw new ValidationException("置换编号不能为空");
        if (string.IsNullOrWhiteSpace(dto.PipelineName))
            throw new ValidationException("管线名称不能为空");

        var berthPlan = await _berthPlanRepository.GetByIdAsync(dto.BerthPlanId);
        if (berthPlan == null)
            throw new NotFoundException($"靠泊计划 {dto.BerthPlanId} 不存在");

        var existing = await _repository.GetByPurgeNoAsync(dto.PurgeNo);
        if (existing != null)
            throw new ValidationException($"置换编号 {dto.PurgeNo} 已存在");

        var entity = new PipelinePurge
        {
            BerthPlanId = dto.BerthPlanId,
            PurgeNo = dto.PurgeNo,
            PipelineName = dto.PipelineName,
            PurgeStartTime = dto.PurgeStartTime,
            OxygenLimit = dto.OxygenLimit,
            PurgeMedium = dto.PurgeMedium,
            ProcessEngineer = dto.ProcessEngineer,
            Status = PipelinePurgeStatus.Pending,
            Remark = dto.Remark,
            CreatedBy = operatorName
        };

        var result = await _repository.AddAsync(entity);
        return MapToDto(result);
    }

    public async Task<PipelinePurgeDto> UpdateAsync(Guid id, UpdatePipelinePurgeDto dto, string operatorName)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null)
            throw new NotFoundException($"管线置换记录 {id} 不存在");

        if (entity.Status == PipelinePurgeStatus.Confirmed)
            throw new BusinessConflictException("已确认的置换记录不允许修改");

        if (dto.PurgeStartTime.HasValue) entity.PurgeStartTime = dto.PurgeStartTime.Value;
        if (dto.PurgeEndTime.HasValue) entity.PurgeEndTime = dto.PurgeEndTime.Value;
        if (dto.OxygenContent.HasValue) entity.OxygenContent = dto.OxygenContent.Value;
        if (dto.OxygenTestTime.HasValue) entity.OxygenTestTime = dto.OxygenTestTime.Value;
        if (dto.Pressure.HasValue) entity.Pressure = dto.Pressure.Value;
        if (dto.Temperature.HasValue) entity.Temperature = dto.Temperature.Value;
        if (dto.ProcessEngineer != null) entity.ProcessEngineer = dto.ProcessEngineer;
        if (dto.Status.HasValue) entity.Status = dto.Status.Value;
        if (dto.Remark != null) entity.Remark = dto.Remark;

        entity.UpdatedBy = operatorName;
        var result = await _repository.UpdateAsync(entity);
        return MapToDto(result);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return false;

        if (entity.Status != PipelinePurgeStatus.Pending)
            throw new BusinessConflictException("只有待处理状态的置换记录可以删除");

        await _repository.DeleteAsync(id);
        return true;
    }

    public async Task<PipelinePurgeDto> ConfirmOxygenContentAsync(Guid id, ConfirmPurgeDto dto, string operatorName)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null)
            throw new NotFoundException($"管线置换记录 {id} 不存在");

        entity.OxygenContent = dto.OxygenContent;
        entity.OxygenTestTime = dto.OxygenTestTime;
        entity.ProcessEngineer = dto.ProcessEngineer;
        entity.Status = dto.OxygenContent <= entity.OxygenLimit
            ? PipelinePurgeStatus.Qualified
            : PipelinePurgeStatus.Failed;
        entity.UpdatedBy = operatorName;

        var result = await _repository.UpdateAsync(entity);
        return MapToDto(result);
    }

    public async Task<PipelinePurgeDto> EngineerConfirmAsync(Guid id, string engineerName)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null)
            throw new NotFoundException($"管线置换记录 {id} 不存在");

        if (entity.Status != PipelinePurgeStatus.Qualified)
            throw new BusinessConflictException("只有合格状态的置换记录可以确认");

        if (entity.OxygenContent > entity.OxygenLimit)
            throw new BusinessConflictException($"氧含量 {entity.OxygenContent}% 未达标（限值 {entity.OxygenLimit}%），不能确认");

        entity.Status = PipelinePurgeStatus.Confirmed;
        entity.ProcessEngineer = engineerName;
        entity.UpdatedBy = engineerName;

        var result = await _repository.UpdateAsync(entity);
        return MapToDto(result);
    }

    public async Task<bool> CanStartUnloadingAsync(Guid berthPlanId)
    {
        var purges = await _repository.GetByBerthPlanIdAsync(berthPlanId);
        return purges.Any(p => p.Status == PipelinePurgeStatus.Qualified || p.Status == PipelinePurgeStatus.Confirmed);
    }

    private static PipelinePurgeDto MapToDto(PipelinePurge entity) => new()
    {
        Id = entity.Id,
        BerthPlanId = entity.BerthPlanId,
        PurgeNo = entity.PurgeNo,
        PipelineName = entity.PipelineName,
        PurgeStartTime = entity.PurgeStartTime,
        PurgeEndTime = entity.PurgeEndTime,
        OxygenContent = entity.OxygenContent,
        OxygenTestTime = entity.OxygenTestTime,
        OxygenLimit = entity.OxygenLimit,
        PurgeMedium = entity.PurgeMedium,
        Pressure = entity.Pressure,
        Temperature = entity.Temperature,
        ProcessEngineer = entity.ProcessEngineer,
        Status = entity.Status,
        Remark = entity.Remark
    };
}
