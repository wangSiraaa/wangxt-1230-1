using LngUnloadingManagement.Domain.Entities;
using LngUnloadingManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace LngUnloadingManagement.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<BerthPlan> BerthPlans { get; set; }
    public DbSet<PipelinePurge> PipelinePurges { get; set; }
    public DbSet<MeteringRecord> MeteringRecords { get; set; }
    public DbSet<ShutdownEvent> ShutdownEvents { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<BerthPlan>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.PlanNo).IsRequired().HasMaxLength(50);
            entity.Property(e => e.VesselName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.VesselImoNo).HasMaxLength(20);
            entity.Property(e => e.BerthNo).HasMaxLength(20);
            entity.Property(e => e.CargoType).HasMaxLength(50);
            entity.Property(e => e.Shipper).HasMaxLength(100);
            entity.Property(e => e.Consignee).HasMaxLength(100);
            entity.Property(e => e.Dispatcher).HasMaxLength(50);
            entity.Property(e => e.PlannedQuantity).HasPrecision(18, 3);
            entity.Property(e => e.Status).HasConversion<int>();
            entity.Property(e => e.Remark).HasMaxLength(500);

            entity.HasMany(e => e.PipelinePurges)
                  .WithOne(p => p.BerthPlan)
                  .HasForeignKey(p => p.BerthPlanId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.MeteringRecords)
                  .WithOne(m => m.BerthPlan)
                  .HasForeignKey(m => m.BerthPlanId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasMany(e => e.ShutdownEvents)
                  .WithOne(s => s.BerthPlan)
                  .HasForeignKey(s => s.BerthPlanId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.PlanNo).IsUnique();
        });

        modelBuilder.Entity<PipelinePurge>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.BerthPlanId).IsRequired();
            entity.Property(e => e.PurgeNo).IsRequired().HasMaxLength(50);
            entity.Property(e => e.PipelineName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.OxygenContent).HasPrecision(10, 4);
            entity.Property(e => e.OxygenLimit).HasPrecision(10, 4);
            entity.Property(e => e.Pressure).HasPrecision(10, 3);
            entity.Property(e => e.Temperature).HasPrecision(10, 3);
            entity.Property(e => e.PurgeMedium).HasMaxLength(50);
            entity.Property(e => e.ProcessEngineer).HasMaxLength(50);
            entity.Property(e => e.Status).HasConversion<int>();
            entity.Property(e => e.Remark).HasMaxLength(500);

            entity.HasIndex(e => e.PurgeNo).IsUnique();
        });

        modelBuilder.Entity<MeteringRecord>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.BerthPlanId).IsRequired();
            entity.Property(e => e.MeteringNo).IsRequired().HasMaxLength(50);
            entity.Property(e => e.LoadingQuantity).HasPrecision(18, 3);
            entity.Property(e => e.UnloadingQuantity).HasPrecision(18, 3);
            entity.Property(e => e.ShipFigureQuantity).HasPrecision(18, 3);
            entity.Property(e => e.ShoreFigureQuantity).HasPrecision(18, 3);
            entity.Property(e => e.DifferenceAmount).HasPrecision(18, 3);
            entity.Property(e => e.DifferenceRate).HasPrecision(10, 4);
            entity.Property(e => e.DifferenceLimitRate).HasPrecision(10, 4);
            entity.Property(e => e.MeteringOperator).HasMaxLength(50);
            entity.Property(e => e.Reviewer).HasMaxLength(50);
            entity.Property(e => e.ReviewComment).HasMaxLength(500);
            entity.Property(e => e.Status).HasConversion<int>();
            entity.Property(e => e.Remark).HasMaxLength(500);

            entity.HasIndex(e => e.MeteringNo).IsUnique();
        });

        modelBuilder.Entity<ShutdownEvent>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.BerthPlanId).IsRequired();
            entity.Property(e => e.ShutdownNo).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Location).HasMaxLength(100);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Cause).HasMaxLength(500);
            entity.Property(e => e.RecoveryCondition).HasMaxLength(500);
            entity.Property(e => e.RecoveryMeasures).HasMaxLength(500);
            entity.Property(e => e.Operator).HasMaxLength(50);
            entity.Property(e => e.ShutdownType).HasConversion<int>();
            entity.Property(e => e.Status).HasConversion<int>();
            entity.Property(e => e.Remark).HasMaxLength(500);

            entity.HasIndex(e => e.ShutdownNo).IsUnique();
        });
    }
}
