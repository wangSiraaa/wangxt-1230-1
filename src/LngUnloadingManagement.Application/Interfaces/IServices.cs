using LngUnloadingManagement.Application.DTOs;

namespace LngUnloadingManagement.Application.Interfaces;

public interface IBerthPlanService
{
    Task<IEnumerable<BerthPlanDto>> GetAllAsync();
    Task<BerthPlanDto?> GetByIdAsync(Guid id);
    Task<BerthPlanDto?> GetByPlanNoAsync(string planNo);
    Task<IEnumerable<BerthPlanDto>> GetByStatusAsync(int status);
    Task<BerthPlanDto> CreateAsync(CreateBerthPlanDto dto, string operatorName);
    Task<BerthPlanDto> UpdateAsync(Guid id, UpdateBerthPlanDto dto, string operatorName);
    Task<bool> DeleteAsync(Guid id);
    Task<BerthPlanDto> StartUnloadingAsync(Guid id, string operatorName);
    Task<BerthPlanDto> CompleteUnloadingAsync(Guid id, string operatorName);
}

public interface IPipelinePurgeService
{
    Task<IEnumerable<PipelinePurgeDto>> GetAllAsync();
    Task<PipelinePurgeDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<PipelinePurgeDto>> GetByBerthPlanIdAsync(Guid berthPlanId);
    Task<PipelinePurgeDto> CreateAsync(CreatePipelinePurgeDto dto, string operatorName);
    Task<PipelinePurgeDto> UpdateAsync(Guid id, UpdatePipelinePurgeDto dto, string operatorName);
    Task<bool> DeleteAsync(Guid id);
    Task<PipelinePurgeDto> ConfirmOxygenContentAsync(Guid id, ConfirmPurgeDto dto, string operatorName);
    Task<PipelinePurgeDto> EngineerConfirmAsync(Guid id, string engineerName);
    Task<bool> CanStartUnloadingAsync(Guid berthPlanId);
}

public interface IMeteringRecordService
{
    Task<IEnumerable<MeteringRecordDto>> GetAllAsync();
    Task<MeteringRecordDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<MeteringRecordDto>> GetByBerthPlanIdAsync(Guid berthPlanId);
    Task<MeteringRecordDto> CreateAsync(CreateMeteringRecordDto dto, string operatorName);
    Task<MeteringRecordDto> UpdateAsync(Guid id, UpdateMeteringRecordDto dto, string operatorName);
    Task<bool> DeleteAsync(Guid id);
    Task<MeteringRecordDto> SubmitAsync(Guid id, string operatorName);
    Task<MeteringRecordDto> ReviewAsync(Guid id, ReviewMeteringDto dto);
}

public interface IShutdownEventService
{
    Task<IEnumerable<ShutdownEventDto>> GetAllAsync();
    Task<ShutdownEventDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<ShutdownEventDto>> GetByBerthPlanIdAsync(Guid berthPlanId);
    Task<IEnumerable<ShutdownEventDto>> GetByStatusAsync(int status);
    Task<ShutdownEventDto> CreateAsync(CreateShutdownEventDto dto, string operatorName);
    Task<ShutdownEventDto> UpdateAsync(Guid id, UpdateShutdownEventDto dto, string operatorName);
    Task<bool> DeleteAsync(Guid id);
    Task<ShutdownEventDto> RecordRecoveryConditionAsync(Guid id, RecordRecoveryConditionDto dto, string operatorName);
    Task<ShutdownEventDto> ResumeAsync(Guid id, string operatorName);
    Task<ShutdownEventDto> CloseAsync(Guid id, string operatorName);
}
