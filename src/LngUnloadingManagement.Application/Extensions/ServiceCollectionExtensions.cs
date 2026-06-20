using LngUnloadingManagement.Application.Interfaces;
using LngUnloadingManagement.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace LngUnloadingManagement.Application.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IBerthPlanService, BerthPlanService>();
        services.AddScoped<IPipelinePurgeService, PipelinePurgeService>();
        services.AddScoped<IMeteringRecordService, MeteringRecordService>();
        services.AddScoped<IShutdownEventService, ShutdownEventService>();

        return services;
    }
}
