using LngUnloadingManagement.Application.DTOs;
using LngUnloadingManagement.Application.Exceptions;
using LngUnloadingManagement.Application.Interfaces;
using LngUnloadingManagement.Domain.Entities;
using LngUnloadingManagement.Domain.Enums;
using LngUnloadingManagement.Domain.Interfaces;

namespace LngUnloadingManagement.Application.Services;

public class MeteringRecordService : IMeteringRecordService
{
    private readonly IMeteringRecordRepository _repository;
    private readonly IBerthPlanRepository _berthPlanRepository;

    public MeteringRecordService(IMeteringRecordRepository repository, IBerthPlanRepository berthPlanRepository)
    {
        _repository = repository;
        _berthPlanRepository = berthPlanRepository;
    }

    public async Task<IEnumerable<MeteringRecordDto>> GetAllAsync()
    {
        var entities = await _repository.GetAllAsync();
        return entities.Select(MapToDto);
    }

    public async Task<MeteringRecordDto?> GetByIdAsync(Guid id)
    {
        var entity = await _repository.GetByIdAsync(id);
        return entity == null ? null : MapToDto(entity);
    }

    public async Task<IEnumerable<MeteringRecordDto>> GetByBerthPlanIdAsync(Guid berthPlanId)
    {
        var entities = await _repository.GetByBerthPlanIdAsync(berthPlanId);
        return entities.Select(MapToDto);
    }

    public async Task<MeteringRecordDto> CreateAsync(CreateMeteringRecordDto dto, string operatorName)
    {
        if (string.IsNullOrWhiteSpace(dto.MeteringNo))
            throw new ValidationException("计量编号不能为空");

        var berthPlan = await _berthPlanRepository.GetByIdAsync(dto.BerthPlanId);
        if (berthPlan == null)
            throw new NotFoundException($"靠泊计划 {dto.BerthPlanId} 不存在");

        var existing = await _repository.GetByMeteringNoAsync(dto.MeteringNo);
        if (existing != null)
            throw new ValidationException($"计量编号 {dto.MeteringNo} 已存在");

        var entity = new MeteringRecord
        {
            BerthPlanId = dto.BerthPlanId,
            MeteringNo = dto.MeteringNo,
            MeteringStartTime = dto.MeteringStartTime,
            MeteringEndTime = dto.MeteringEndTime,
            LoadingQuantity = dto.LoadingQuantity,
            UnloadingQuantity = dto.UnloadingQuantity,
            ShipFigureQuantity = dto.ShipFigureQuantity,
            ShoreFigureQuantity = dto.ShoreFigureQuantity,
            DifferenceLimitRate = dto.DifferenceLimitRate,
            MeteringOperator = dto.MeteringOperator,
            Status = MeteringStatus.Draft,
            Remark = dto.Remark,
            CreatedBy = operatorName
        };

        CalculateDifference(entity);

        var result = await _repository.AddAsync(entity);
        return MapToDto(result);
    }

    public async Task<MeteringRecordDto> UpdateAsync(Guid id, UpdateMeteringRecordDto dto, string operatorName)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null)
            throw new NotFoundException($"计量记录 {id} 不存在");

        if (entity.Status != MeteringStatus.Draft && entity.Status != MeteringStatus.Rejected)
            throw new BusinessConflictException($"当前状态 {entity.Status} 不允许修改");

        if (dto.MeteringStartTime.HasValue) entity.MeteringStartTime = dto.MeteringStartTime.Value;
        if (dto.MeteringEndTime.HasValue) entity.MeteringEndTime = dto.MeteringEndTime.Value;
        if (dto.LoadingQuantity.HasValue) entity.LoadingQuantity = dto.LoadingQuantity.Value;
        if (dto.UnloadingQuantity.HasValue) entity.UnloadingQuantity = dto.UnloadingQuantity.Value;
        if (dto.ShipFigureQuantity.HasValue) entity.ShipFigureQuantity = dto.ShipFigureQuantity.Value;
        if (dto.ShoreFigureQuantity.HasValue) entity.ShoreFigureQuantity = dto.ShoreFigureQuantity.Value;
        if (dto.MeteringOperator != null) entity.MeteringOperator = dto.MeteringOperator;
        if (dto.Remark != null) entity.Remark = dto.Remark;

        CalculateDifference(entity);
        entity.UpdatedBy = operatorName;

        var result = await _repository.UpdateAsync(entity);
        return MapToDto(result);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null) return false;

        if (entity.Status != MeteringStatus.Draft)
            throw new BusinessConflictException("只有草稿状态的计量记录可以删除");

        await _repository.DeleteAsync(id);
        return true;
    }

    public async Task<MeteringRecordDto> SubmitAsync(Guid id, string operatorName)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null)
            throw new NotFoundException($"计量记录 {id} 不存在");

        if (entity.Status != MeteringStatus.Draft)
            throw new BusinessConflictException($"当前状态 {entity.Status} 不允许提交");

        CalculateDifference(entity);
        entity.Status = entity.IsDifferenceExceeded ? MeteringStatus.ReviewRequired : MeteringStatus.Submitted;
        entity.UpdatedBy = operatorName;

        var result = await _repository.UpdateAsync(entity);
        return MapToDto(result);
    }

    public async Task<MeteringRecordDto> ReviewAsync(Guid id, ReviewMeteringDto dto)
    {
        var entity = await _repository.GetByIdAsync(id);
        if (entity == null)
            throw new NotFoundException($"计量记录 {id} 不存在");

        if (entity.Status != MeteringStatus.ReviewRequired)
            throw new BusinessConflictException($"当前状态 {entity.Status} 不需要复核");

        if (string.IsNullOrWhiteSpace(dto.Reviewer))
            throw new ValidationException("复核人不能为空");

        entity.Reviewer = dto.Reviewer;
        entity.ReviewComment = dto.ReviewComment;
        entity.ReviewTime = DateTime.UtcNow;
        entity.Status = dto.IsApproved ? MeteringStatus.Confirmed : MeteringStatus.Rejected;

        var result = await _repository.UpdateAsync(entity);
        return MapToDto(result);
    }

    private static void CalculateDifference(MeteringRecord entity)
    {
        if (entity.ShipFigureQuantity.HasValue && entity.ShoreFigureQuantity.HasValue)
        {
            entity.DifferenceAmount = Math.Abs(entity.ShipFigureQuantity.Value - entity.ShoreFigureQuantity.Value);
            if (entity.ShipFigureQuantity.Value > 0)
            {
                entity.DifferenceRate = (entity.DifferenceAmount.Value / entity.ShipFigureQuantity.Value) * 100m;
                entity.IsDifferenceExceeded = entity.DifferenceRate.Value > entity.DifferenceLimitRate;
            }
        }
        else if (entity.LoadingQuantity.HasValue && entity.UnloadingQuantity.HasValue)
        {
            entity.DifferenceAmount = Math.Abs(entity.LoadingQuantity.Value - entity.UnloadingQuantity.Value);
            if (entity.LoadingQuantity.Value > 0)
            {
                entity.DifferenceRate = (entity.DifferenceAmount.Value / entity.LoadingQuantity.Value) * 100m;
                entity.IsDifferenceExceeded = entity.DifferenceRate.Value > entity.DifferenceLimitRate;
            }
        }
    }

    private static MeteringRecordDto MapToDto(MeteringRecord entity) => new()
    {
        Id = entity.Id,
        BerthPlanId = entity.BerthPlanId,
        MeteringNo = entity.MeteringNo,
        MeteringStartTime = entity.MeteringStartTime,
        MeteringEndTime = entity.MeteringEndTime,
        LoadingQuantity = entity.LoadingQuantity,
        UnloadingQuantity = entity.UnloadingQuantity,
        ShipFigureQuantity = entity.ShipFigureQuantity,
        ShoreFigureQuantity = entity.ShoreFigureQuantity,
        DifferenceAmount = entity.DifferenceAmount,
        DifferenceRate = entity.DifferenceRate,
        DifferenceLimitRate = entity.DifferenceLimitRate,
        IsDifferenceExceeded = entity.IsDifferenceExceeded,
        MeteringOperator = entity.MeteringOperator,
        Reviewer = entity.Reviewer,
        ReviewTime = entity.ReviewTime,
        ReviewComment = entity.ReviewComment,
        Status = entity.Status,
        Remark = entity.Remark
    };
}
