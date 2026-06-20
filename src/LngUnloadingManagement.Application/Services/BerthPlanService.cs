using LngUnloadingManagement.Application.DTOs;
using LngUnloadingManagement.Application.Exceptions;
using LngUnloadingManagement.Application.Interfaces;
using LngUnloadingManagement.Domain.Entities;
using LngUnloadingManagement.Domain.Enums;
using LngUnloadingManagement.Domain.Interfaces;

namespace LngUnloadingManagement.Application.Services;

public class BerthPlanService : IBerthPlanService
{
    private readonly IBerthPlanRepository _repository;
    private readonly IPipelinePurgeRepository _purgeRepository;

    public BerthPlanService(IBerthPlanRepository repository, IPipelinePurgeRepository purgeRepository)
    {
        _repository = repository;
        _purgeRepository = purgeRepository;
    }

    public async Task<IEnumerable<BerthPlanDto>> GetAllAsync()
    {
        var entities = await _repository.GetAllAsync();
        return entities.Select(MapToDto);
    }

    public async Task<BerthPlanDto?> GetByIdAsync(Guid id)
    {
        var entity = await _repository.GetByIdAsync(id);
        return entity == null ? null : MapToDto(entity);
    }

    public async Task<BerthPlanDto?> GetByPlanNoAsync(string planNo)
    {
        var entity = await _repository.GetByPlanNoAsync(planNo);
        return entity == null ? null : MapToDto(entity);
    }

    public async Task<IEnumerable<BerthPlanDto>> GetByStatusAsync(int status)
    {
        var entities = await _repository.GetByStatusAsync(status);
        return entities.Select(MapToDto);
    }

    public async Task<BerthPlanDto> CreateAsync(CreateBerthPlanDto dto, string operatorName)
    {
        if (string.IsNullOrWhiteSpace(dto.PlanNo))
            throw new ValidationException("计划编号不能为空");
        if (string.IsNullOrWhiteSpace(dto.VesselName))
            throw new ValidationException("船名不能为空");

        var existing = await _repository.GetByPlanNoAsync(dto.PlanNo);
        if (existing != null)
            throw new ValidationException($"计划编号 {dto.PlanNo} 已存在");

        var entity = new BerthPlan
        {
            PlanNo = dto.PlanNo,
            VesselName = dto.VesselName,
            VesselImoNo = dto.VesselImoNo ?? string.Empty,
            BerthNo = dto.BerthNo,
            Eta = dto.Eta,
            Etd = dto.Etd,
            PlannedQuantity = dto.PlannedQuantity,
            CargoType = dto.CargoType,
            Shipper = dto.Shipper,
            Consignee = dto.Consignee,
            Dispatcher = dto.Dispatcher,
            Status = BerthPlanStatus.Draft,
            Remark = dto.Remark,
            CreatedBy = operatorName
        };

        var result = await _repository.AddAsync(entity);
        return MapToDto(result);
    }

    public async Task<BerthPlanDto> UpdateAsync(Guid id, UpdateBerthPlanDto dto, string operatorName)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null)
            throw new NotFoundException($"靠泊计划 {id} 不存在");

        if (entity.Status == BerthPlanStatus.Completed || entity.Status == BerthPlanStatus.Cancelled)
            throw new BusinessConflictException($"当前状态 {entity.Status} 不允许修改");

        if (dto.BerthNo != null) entity.BerthNo = dto.BerthNo;
        if (dto.Eta.HasValue) entity.Eta = dto.Eta.Value;
        if (dto.Etd.HasValue) entity.Etd = dto.Etd.Value;
        if (dto.ActualBerthingTime.HasValue) entity.ActualBerthingTime = dto.ActualBerthingTime.Value;
        if (dto.ActualUnloadingStartTime.HasValue) entity.ActualUnloadingStartTime = dto.ActualUnloadingStartTime.Value;
        if (dto.ActualUnloadingEndTime.HasValue) entity.ActualUnloadingEndTime = dto.ActualUnloadingEndTime.Value;
        if (dto.PlannedQuantity.HasValue) entity.PlannedQuantity = dto.PlannedQuantity.Value;
        if (dto.CargoType != null) entity.CargoType = dto.CargoType;
        if (dto.Dispatcher != null) entity.Dispatcher = dto.Dispatcher;
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

        if (entity.Status != BerthPlanStatus.Draft)
            throw new BusinessConflictException("只有草稿状态的计划可以删除");

        await _repository.DeleteAsync(id);
        return true;
    }

    public async Task<BerthPlanDto> StartUnloadingAsync(Guid id, string operatorName)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null)
            throw new NotFoundException($"靠泊计划 {id} 不存在");

        var purges = await _purgeRepository.GetByBerthPlanIdAsync(id);
        var hasQualifiedPurge = purges.Any(p => p.Status == PipelinePurgeStatus.Qualified || p.Status == PipelinePurgeStatus.Confirmed);
        if (!hasQualifiedPurge)
            throw new BusinessConflictException("管线置换氧含量未达标，不能开始卸船");

        if (entity.Status != BerthPlanStatus.Berthing && entity.Status != BerthPlanStatus.Scheduled)
            throw new BusinessConflictException($"当前状态 {entity.Status} 不允许开始卸船");

        entity.Status = BerthPlanStatus.Unloading;
        entity.ActualUnloadingStartTime = DateTime.UtcNow;
        entity.UpdatedBy = operatorName;

        var result = await _repository.UpdateAsync(entity);
        return MapToDto(result);
    }

    public async Task<BerthPlanDto> CompleteUnloadingAsync(Guid id, string operatorName)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null)
            throw new NotFoundException($"靠泊计划 {id} 不存在");

        if (entity.Status != BerthPlanStatus.Unloading)
            throw new BusinessConflictException($"当前状态 {entity.Status} 不允许完成卸船");

        var pendingShutdowns = entity.ShutdownEvents.Any(s => s.Status != ShutdownStatus.Resumed && s.Status != ShutdownStatus.Closed);
        if (pendingShutdowns)
            throw new BusinessConflictException("存在未恢复的异常停输事件，不能完成卸船");

        entity.Status = BerthPlanStatus.Completed;
        entity.ActualUnloadingEndTime = DateTime.UtcNow;
        entity.UpdatedBy = operatorName;

        var result = await _repository.UpdateAsync(entity);
        return MapToDto(result);
    }

    private static BerthPlanDto MapToDto(BerthPlan entity) => new()
    {
        Id = entity.Id,
        PlanNo = entity.PlanNo,
        VesselName = entity.VesselName,
        VesselImoNo = entity.VesselImoNo,
        BerthNo = entity.BerthNo,
        Eta = entity.Eta,
        Etd = entity.Etd,
        ActualBerthingTime = entity.ActualBerthingTime,
        ActualUnloadingStartTime = entity.ActualUnloadingStartTime,
        ActualUnloadingEndTime = entity.ActualUnloadingEndTime,
        PlannedQuantity = entity.PlannedQuantity,
        CargoType = entity.CargoType,
        Shipper = entity.Shipper,
        Consignee = entity.Consignee,
        Dispatcher = entity.Dispatcher,
        Status = entity.Status,
        Remark = entity.Remark
    };
}
