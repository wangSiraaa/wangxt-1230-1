namespace LngUnloadingManagement.Domain.Enums;

public enum ShutdownStatus
{
    Occurred = 0,
    Processing = 1,
    Recovering = 2,
    Resumed = 3,
    Closed = 4
}

public enum ShutdownType
{
    EquipmentFailure = 0,
    SafetyIncident = 1,
    Weather = 2,
    Operational = 3,
    Other = 4
}
