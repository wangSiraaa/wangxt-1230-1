using LngUnloadingManagement.Domain.Entities;

namespace LngUnloadingManagement.Domain.Interfaces;

public interface IRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(Guid id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<T> AddAsync(T entity);
    Task<T> UpdateAsync(T entity);
    Task DeleteAsync(Guid id);
}

public interface IBerthPlanRepository : IRepository<BerthPlan>
{
    Task<IEnumerable<BerthPlan>> GetByStatusAsync(int status);
    Task<BerthPlan?> GetByPlanNoAsync(string planNo);
    Task<BerthPlan?> GetWithDetailsByIdAsync(Guid id);
}

public interface IPipelinePurgeRepository : IRepository<PipelinePurge>
{
    Task<IEnumerable<PipelinePurge>> GetByBerthPlanIdAsync(Guid berthPlanId);
    Task<PipelinePurge?> GetByPurgeNoAsync(string purgeNo);
}

public interface IMeteringRecordRepository : IRepository<MeteringRecord>
{
    Task<IEnumerable<MeteringRecord>> GetByBerthPlanIdAsync(Guid berthPlanId);
    Task<MeteringRecord?> GetByMeteringNoAsync(string meteringNo);
}

public interface IShutdownEventRepository : IRepository<ShutdownEvent>
{
    Task<IEnumerable<ShutdownEvent>> GetByBerthPlanIdAsync(Guid berthPlanId);
    Task<IEnumerable<ShutdownEvent>> GetByStatusAsync(int status);
}
