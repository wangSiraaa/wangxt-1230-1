using LngUnloadingManagement.Domain.Entities;
using LngUnloadingManagement.Domain.Interfaces;
using LngUnloadingManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace LngUnloadingManagement.Infrastructure.Repositories;

public class Repository<T> : IRepository<T> where T : BaseEntity
{
    protected readonly AppDbContext _context;

    public Repository(AppDbContext context)
    {
        _context = context;
    }

    public virtual async Task<T?> GetByIdAsync(Guid id)
    {
        return await _context.Set<T>().FindAsync(id);
    }

    public virtual async Task<IEnumerable<T>> GetAllAsync()
    {
        return await _context.Set<T>().OrderByDescending(x => x.CreatedAt).ToListAsync();
    }

    public virtual async Task<T> AddAsync(T entity)
    {
        entity.Id = entity.Id == Guid.Empty ? Guid.NewGuid() : entity.Id;
        entity.CreatedAt = DateTime.UtcNow;
        await _context.Set<T>().AddAsync(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public virtual async Task<T> UpdateAsync(T entity)
    {
        entity.UpdatedAt = DateTime.UtcNow;
        _context.Set<T>().Update(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public virtual async Task DeleteAsync(Guid id)
    {
        var entity = await _context.Set<T>().FindAsync(id);
        if (entity != null)
        {
            _context.Set<T>().Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
}

public class BerthPlanRepository : Repository<BerthPlan>, IBerthPlanRepository
{
    public BerthPlanRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<BerthPlan>> GetByStatusAsync(int status)
    {
        return await _context.BerthPlans
            .Where(x => (int)x.Status == status)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();
    }

    public async Task<BerthPlan?> GetByPlanNoAsync(string planNo)
    {
        return await _context.BerthPlans
            .Include(x => x.PipelinePurges)
            .Include(x => x.MeteringRecords)
            .Include(x => x.ShutdownEvents)
            .FirstOrDefaultAsync(x => x.PlanNo == planNo);
    }

    public override async Task<BerthPlan?> GetByIdAsync(Guid id)
    {
        return await _context.BerthPlans
            .Include(x => x.PipelinePurges)
            .Include(x => x.MeteringRecords)
            .Include(x => x.ShutdownEvents)
            .FirstOrDefaultAsync(x => x.Id == id);
    }
}

public class PipelinePurgeRepository : Repository<PipelinePurge>, IPipelinePurgeRepository
{
    public PipelinePurgeRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<PipelinePurge>> GetByBerthPlanIdAsync(Guid berthPlanId)
    {
        return await _context.PipelinePurges
            .Where(x => x.BerthPlanId == berthPlanId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();
    }

    public async Task<PipelinePurge?> GetByPurgeNoAsync(string purgeNo)
    {
        return await _context.PipelinePurges
            .Include(x => x.BerthPlan)
            .FirstOrDefaultAsync(x => x.PurgeNo == purgeNo);
    }
}

public class MeteringRecordRepository : Repository<MeteringRecord>, IMeteringRecordRepository
{
    public MeteringRecordRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<MeteringRecord>> GetByBerthPlanIdAsync(Guid berthPlanId)
    {
        return await _context.MeteringRecords
            .Where(x => x.BerthPlanId == berthPlanId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();
    }

    public async Task<MeteringRecord?> GetByMeteringNoAsync(string meteringNo)
    {
        return await _context.MeteringRecords
            .Include(x => x.BerthPlan)
            .FirstOrDefaultAsync(x => x.MeteringNo == meteringNo);
    }
}

public class ShutdownEventRepository : Repository<ShutdownEvent>, IShutdownEventRepository
{
    public ShutdownEventRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<ShutdownEvent>> GetByBerthPlanIdAsync(Guid berthPlanId)
    {
        return await _context.ShutdownEvents
            .Where(x => x.BerthPlanId == berthPlanId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<ShutdownEvent>> GetByStatusAsync(int status)
    {
        return await _context.ShutdownEvents
            .Where(x => (int)x.Status == status)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();
    }
}
