using LngUnloadingManagement.Domain.Enums;

namespace LngUnloadingManagement.Application.DTOs;

public class MeteringRecordDto
{
    public Guid Id { get; set; }
    public Guid BerthPlanId { get; set; }
    public string MeteringNo { get; set; } = string.Empty;
    public DateTime? MeteringStartTime { get; set; }
    public DateTime? MeteringEndTime { get; set; }
    public decimal? LoadingQuantity { get; set; }
    public decimal? UnloadingQuantity { get; set; }
    public decimal? ShipFigureQuantity { get; set; }
    public decimal? ShoreFigureQuantity { get; set; }
    public decimal? DifferenceAmount { get; set; }
    public decimal? DifferenceRate { get; set; }
    public decimal DifferenceLimitRate { get; set; }
    public bool IsDifferenceExceeded { get; set; }
    public string? MeteringOperator { get; set; }
    public string? Reviewer { get; set; }
    public DateTime? ReviewTime { get; set; }
    public string? ReviewComment { get; set; }
    public MeteringStatus Status { get; set; }
    public string? Remark { get; set; }
}

public class CreateMeteringRecordDto
{
    public Guid BerthPlanId { get; set; }
    public string MeteringNo { get; set; } = string.Empty;
    public DateTime? MeteringStartTime { get; set; }
    public DateTime? MeteringEndTime { get; set; }
    public decimal? LoadingQuantity { get; set; }
    public decimal? UnloadingQuantity { get; set; }
    public decimal? ShipFigureQuantity { get; set; }
    public decimal? ShoreFigureQuantity { get; set; }
    public decimal DifferenceLimitRate { get; set; } = 0.3m;
    public string? MeteringOperator { get; set; }
    public string? Remark { get; set; }
}

public class UpdateMeteringRecordDto
{
    public DateTime? MeteringStartTime { get; set; }
    public DateTime? MeteringEndTime { get; set; }
    public decimal? LoadingQuantity { get; set; }
    public decimal? UnloadingQuantity { get; set; }
    public decimal? ShipFigureQuantity { get; set; }
    public decimal? ShoreFigureQuantity { get; set; }
    public string? MeteringOperator { get; set; }
    public string? Remark { get; set; }
}

public class ReviewMeteringDto
{
    public string Reviewer { get; set; } = string.Empty;
    public string ReviewComment { get; set; } = string.Empty;
    public bool IsApproved { get; set; }
}
