using LngUnloadingManagement.Domain.Enums;

namespace LngUnloadingManagement.Application.DTOs;

public class PipelinePurgeDto
{
    public Guid Id { get; set; }
    public Guid BerthPlanId { get; set; }
    public string PurgeNo { get; set; } = string.Empty;
    public string PipelineName { get; set; } = string.Empty;
    public DateTime? PurgeStartTime { get; set; }
    public DateTime? PurgeEndTime { get; set; }
    public decimal? OxygenContent { get; set; }
    public DateTime? OxygenTestTime { get; set; }
    public decimal OxygenLimit { get; set; }
    public string? PurgeMedium { get; set; }
    public decimal? Pressure { get; set; }
    public decimal? Temperature { get; set; }
    public string? ProcessEngineer { get; set; }
    public PipelinePurgeStatus Status { get; set; }
    public string? Remark { get; set; }
}

public class CreatePipelinePurgeDto
{
    public Guid BerthPlanId { get; set; }
    public string PurgeNo { get; set; } = string.Empty;
    public string PipelineName { get; set; } = string.Empty;
    public DateTime? PurgeStartTime { get; set; }
    public decimal OxygenLimit { get; set; } = 0.5m;
    public string? PurgeMedium { get; set; }
    public string? ProcessEngineer { get; set; }
    public string? Remark { get; set; }
}

public class UpdatePipelinePurgeDto
{
    public DateTime? PurgeStartTime { get; set; }
    public DateTime? PurgeEndTime { get; set; }
    public decimal? OxygenContent { get; set; }
    public DateTime? OxygenTestTime { get; set; }
    public decimal? Pressure { get; set; }
    public decimal? Temperature { get; set; }
    public string? ProcessEngineer { get; set; }
    public PipelinePurgeStatus? Status { get; set; }
    public string? Remark { get; set; }
}

public class ConfirmPurgeDto
{
    public decimal OxygenContent { get; set; }
    public DateTime OxygenTestTime { get; set; }
    public string ProcessEngineer { get; set; } = string.Empty;
}
