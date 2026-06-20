using LngUnloadingManagement.Domain.Enums;

namespace LngUnloadingManagement.Domain.Entities;

public class BerthPlan : BaseEntity
{
    public string PlanNo { get; set; } = string.Empty;
    public string VesselName { get; set; } = string.Empty;
    public string VesselImoNo { get; set; } = string.Empty;
    public string? BerthNo { get; set; }
    public DateTime? Eta { get; set; }
    public DateTime? Etd { get; set; }
    public DateTime? ActualBerthingTime { get; set; }
    public DateTime? ActualUnloadingStartTime { get; set; }
    public DateTime? ActualUnloadingEndTime { get; set; }
    public decimal? PlannedQuantity { get; set; }
    public string? CargoType { get; set; }
    public string? Shipper { get; set; }
    public string? Consignee { get; set; }
    public string? Dispatcher { get; set; }
    public BerthPlanStatus Status { get; set; } = BerthPlanStatus.Draft;
    public string? Remark { get; set; }

    public virtual ICollection<PipelinePurge> PipelinePurges { get; set; } = new List<PipelinePurge>();
    public virtual ICollection<MeteringRecord> MeteringRecords { get; set; } = new List<MeteringRecord>();
    public virtual ICollection<ShutdownEvent> ShutdownEvents { get; set; } = new List<ShutdownEvent>();
}
