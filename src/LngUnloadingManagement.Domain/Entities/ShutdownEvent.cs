using LngUnloadingManagement.Domain.Enums;

namespace LngUnloadingManagement.Domain.Entities;

public class ShutdownEvent : BaseEntity
{
    public Guid BerthPlanId { get; set; }
    public string ShutdownNo { get; set; } = string.Empty;
    public ShutdownType ShutdownType { get; set; } = ShutdownType.Operational;
    public DateTime ShutdownTime { get; set; }
    public DateTime? ResumeTime { get; set; }
    public TimeSpan? Duration { get; set; }
    public string? Location { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? Cause { get; set; }
    public string? RecoveryCondition { get; set; }
    public string? RecoveryMeasures { get; set; }
    public bool RecoveryConditionRecorded { get; set; }
    public string? Operator { get; set; }
    public ShutdownStatus Status { get; set; } = ShutdownStatus.Occurred;
    public string? Remark { get; set; }

    public virtual BerthPlan? BerthPlan { get; set; }
}
