using LngUnloadingManagement.Domain.Enums;

namespace LngUnloadingManagement.Domain.Entities;

public class PipelinePurge : BaseEntity
{
    public Guid BerthPlanId { get; set; }
    public string PurgeNo { get; set; } = string.Empty;
    public string PipelineName { get; set; } = string.Empty;
    public DateTime? PurgeStartTime { get; set; }
    public DateTime? PurgeEndTime { get; set; }
    public decimal? OxygenContent { get; set; }
    public DateTime? OxygenTestTime { get; set; }
    public decimal OxygenLimit { get; set; } = 0.5m;
    public string? PurgeMedium { get; set; }
    public decimal? Pressure { get; set; }
    public decimal? Temperature { get; set; }
    public string? ProcessEngineer { get; set; }
    public PipelinePurgeStatus Status { get; set; } = PipelinePurgeStatus.Pending;
    public string? Remark { get; set; }

    public virtual BerthPlan? BerthPlan { get; set; }
}
