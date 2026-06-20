using LngUnloadingManagement.Application.DTOs;
using LngUnloadingManagement.Application.Exceptions;
using LngUnloadingManagement.Application.Interfaces;
using LngUnloadingManagement.Domain.Entities;
using LngUnloadingManagement.Domain.Enums;
using LngUnloadingManagement.Domain.Interfaces;

namespace LngUnloadingManagement.Application.Services;

public class ShutdownEventService : IShutdownEventService
{
    private readonly IShutdownEventRepository _repository;
    private readonly IBerthPlanRepository _berthPlanRepository;

    public ShutdownEventService(IShutdownEventRepository repository, IBerthPlanRepository berthPlanRepository)
    {
        _repository = repository;
        _berthPlanRepository = berthPlanRepository;
    }

    public async Task<IEnumerable<ShutdownEventDto>> GetAllAsync()
    {
        var entities = await _repository.GetAllAsync();
        return entities.Select(MapToDto);
    }

    public async Task<ShutdownEventDto?> GetByIdAsync(Guid id)
    {
        var entity = await _repository.GetByIdAsync(id);
        return entity == null ? null : MapToDto(entity);
    }

    public async Task<IEnumerable<ShutdownEventDto>> GetByBerthPlanIdAsync(Guid berthPlanId)
    {
        var entities = await _repository.GetByBerthPlanIdAsync(berthPlanId);
        return entities.Select(MapToDto);
    }

    public async Task<IEnumerable<ShutdownEventDto>> GetByStatusAsync(int status)
    {
        var entities = await _repository.GetByStatusAsync(status);
        return entities.Select(MapToDto);
    }

    public async Task<ShutdownEventDto> CreateAsync(CreateShutdownEventDto dto, string operatorName)
    {
        if (string.IsNullOrWhiteSpace(dto.ShutdownNo))
            throw new ValidationException("停输编号不能为空");
        if (string.IsNullOrWhiteSpace(dto.Description))
            throw new ValidationException("停输描述不能为空");

        var berthPlan = await _berthPlanRepository.GetByIdAsync(dto.BerthPlanId);
        if (berthPlan == null)
            throw new NotFoundException($"靠泊计划 {dto.BerthPlanId} 不存在");

        var entity = new ShutdownEvent
        {
            BerthPlanId = dto.BerthPlanId,
            ShutdownNo = dto.ShutdownNo,
            ShutdownType = dto.ShutdownType,
            ShutdownTime = dto.ShutdownTime,
            Location = dto.Location,
            Description = dto.Description,
            Cause = dto.Cause,
            Operator = dto.Operator,
            Status = ShutdownStatus.Occurred,
            RecoveryConditionRecorded = false,
            Remark = dto.Remark,
            CreatedBy = operatorName
        };

        var result = await _repository.AddAsync(entity);
        return MapToDto(result);
    }

    public async Task<ShutdownEventDto> UpdateAsync(Guid id, UpdateShutdownEventDto dto, string operatorName)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null)
            throw new NotFoundException($"停输事件 {id} 不存在");

        if (entity.Status == ShutdownStatus.Closed)
            throw new BusinessConflictException("已关闭的停输事件不允许修改");

        if (dto.ShutdownType.HasValue) entity.ShutdownType = dto.ShutdownType.Value;
        if (dto.ShutdownTime.HasValue) entity.ShutdownTime = dto.ShutdownTime.Value;
        if (dto.ResumeTime.HasValue) entity.ResumeTime = dto.ResumeTime.Value;
        if (dto.Location != null) entity.Location = dto.Location;
        if (dto.Description != null) entity.Description = dto.Description;
        if (dto.Cause != null) entity.Cause = dto.Cause;
        if (dto.RecoveryMeasures != null) entity.RecoveryMeasures = dto.RecoveryMeasures;
        if (dto.Operator != null) entity.Operator = dto.Operator;
        if (dto.Status.HasValue) entity.Status = dto.Status.Value;
        if (dto.Remark != null) entity.Remark = dto.Remark;

        if (entity.ResumeTime.HasValue)
        {
            entity.Duration = entity.ResumeTime.Value - entity.ShutdownTime;
        }

        entity.UpdatedBy = operatorName;
        var result = await _repository.UpdateAsync(entity);
        return MapToDto(result);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return false;

        if (entity.Status != ShutdownStatus.Occurred)
            throw new BusinessConflictException("只有已发生状态的停输事件可以删除");

        await _repository.DeleteAsync(id);
        return true;
    }

    public async Task<ShutdownEventDto> RecordRecoveryConditionAsync(Guid id, RecordRecoveryConditionDto dto, string operatorName)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null)
            throw new NotFoundException($"停输事件 {id} 不存在");

        if (string.IsNullOrWhiteSpace(dto.RecoveryCondition))
            throw new ValidationException("恢复条件不能为空");

        entity.RecoveryCondition = dto.RecoveryCondition;
        entity.RecoveryMeasures = dto.RecoveryMeasures;
        entity.RecoveryConditionRecorded = true;
        entity.Status = ShutdownStatus.Processing;
        entity.UpdatedBy = operatorName;

        if (dto.ResumeTime.HasValue)
        {
            entity.ResumeTime = dto.ResumeTime.Value;
            entity.Duration = dto.ResumeTime.Value - entity.ShutdownTime;
        }

        var result = await _repository.UpdateAsync(entity);
        return MapToDto(result);
    }

    public async Task<ShutdownEventDto> ResumeAsync(Guid id, string operatorName)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null)
            throw new NotFoundException($"停输事件 {id} 不存在");

        if (!entity.RecoveryConditionRecorded)
            throw new BusinessConflictException("异常停输后必须先记录恢复条件才能恢复");

        if (entity.Status != ShutdownStatus.Processing && entity.Status != ShutdownStatus.Occurred)
            throw new BusinessConflictException($"当前状态 {entity.Status} 不允许恢复");

        entity.ResumeTime = DateTime.UtcNow;
        entity.Duration = entity.ResumeTime.Value - entity.ShutdownTime;
        entity.Status = ShutdownStatus.Resumed;
        entity.UpdatedBy = operatorName;

        var result = await _repository.UpdateAsync(entity);
        return MapToDto(result);
    }

    public async Task<ShutdownEventDto> CloseAsync(Guid id, string operatorName)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null)
            throw new NotFoundException($"停输事件 {id} 不存在");

        if (entity.Status != ShutdownStatus.Resumed)
            throw new BusinessConflictException($"当前状态 {entity.Status} 不允许关闭，必须先恢复");

        entity.Status = ShutdownStatus.Closed;
        entity.UpdatedBy = operatorName;

        var result = await _repository.UpdateAsync(entity);
        return MapToDto(result);
    }

    private static ShutdownEventDto MapToDto(ShutdownEvent entity) => new()
    {
        Id = entity.Id,
        BerthPlanId = entity.BerthPlanId,
        ShutdownNo = entity.ShutdownNo,
        ShutdownType = entity.ShutdownType,
        ShutdownTime = entity.ShutdownTime,
        ResumeTime = entity.ResumeTime,
        Duration = entity.Duration,
        Location = entity.Location,
        Description = entity.Description,
        Cause = entity.Cause,
        RecoveryCondition = entity.RecoveryCondition,
        RecoveryMeasures = entity.RecoveryMeasures,
        RecoveryConditionRecorded = entity.RecoveryConditionRecorded,
        Operator = entity.Operator,
        Status = entity.Status,
        Remark = entity.Remark
    };
}
