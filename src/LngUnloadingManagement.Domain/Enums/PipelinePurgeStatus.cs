namespace LngUnloadingManagement.Domain.Enums;

public enum PipelinePurgeStatus
{
    Pending = 0,
    InProgress = 1,
    OxygenTesting = 2,
    Qualified = 3,
    Failed = 4,
    Confirmed = 5
}
