using LngUnloadingManagement.Domain.Interfaces;
using LngUnloadingManagement.Infrastructure.Data;
using LngUnloadingManagement.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace LngUnloadingManagement.Infrastructure.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<IBerthPlanRepository, BerthPlanRepository>();
        services.AddScoped<IPipelinePurgeRepository, PipelinePurgeRepository>();
        services.AddScoped<IMeteringRecordRepository, MeteringRecordRepository>();
        services.AddScoped<IShutdownEventRepository, ShutdownEventRepository>();

        return services;
    }
}
