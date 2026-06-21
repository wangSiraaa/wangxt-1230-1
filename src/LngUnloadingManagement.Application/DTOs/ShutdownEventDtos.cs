using LngUnloadingManagement.Domain.Enums;

namespace LngUnloadingManagement.Application.DTOs;

public class ShutdownEventDto
{
    public Guid Id { get; set; }
    public Guid BerthPlanId { get; set; }
    public string ShutdownNo { get; set; } = string.Empty;
    public ShutdownType ShutdownType { get; set; }
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
    public ShutdownStatus Status { get; set; }
    public string? Remark { get; set; }
}

public class CreateShutdownEventDto
{
    public Guid BerthPlanId { get; set; }
    public string ShutdownNo { get; set; } = string.Empty;
    public ShutdownType ShutdownType { get; set; }
    public DateTime ShutdownTime { get; set; }
    public string? Location { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? Cause { get; set; }
    public string? RecoveryCondition { get; set; }
    public string? RecoveryMeasures { get; set; }
    public string? Operator { get; set; }
    public string? Remark { get; set; }
}

public class UpdateShutdownEventDto
{
    public ShutdownType? ShutdownType { get; set; }
    public DateTime? ShutdownTime { get; set; }
    public DateTime? ResumeTime { get; set; }
    public string? Location { get; set; }
    public string? Description { get; set; }
    public string? Cause { get; set; }
    public string? RecoveryCondition { get; set; }
    public string? RecoveryMeasures { get; set; }
    public string? Operator { get; set; }
    public ShutdownStatus? Status { get; set; }
    public string? Remark { get; set; }
}

public class RecordRecoveryConditionDto
{
    public string RecoveryCondition { get; set; } = string.Empty;
    public string? RecoveryMeasures { get; set; }
    public DateTime? ResumeTime { get; set; }
}
