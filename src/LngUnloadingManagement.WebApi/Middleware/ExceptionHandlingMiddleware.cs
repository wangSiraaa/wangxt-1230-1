using System.Net;
using System.Text.Json;
using LngUnloadingManagement.Application.Exceptions;

namespace LngUnloadingManagement.WebApi.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        HttpStatusCode status;
        string message;

        switch (exception)
        {
            case ValidationException validationException:
                status = HttpStatusCode.BadRequest;
                message = validationException.Message;
                _logger.LogWarning(validationException, "Validation error: {Message}", message);
                break;
            case NotFoundException notFoundException:
                status = HttpStatusCode.NotFound;
                message = notFoundException.Message;
                _logger.LogWarning(notFoundException, "Not found: {Message}", message);
                break;
            case BusinessConflictException conflictException:
                status = HttpStatusCode.Conflict;
                message = conflictException.Message;
                _logger.LogWarning(conflictException, "Conflict error: {Message}", message);
                break;
            case BusinessException businessException:
                status = (HttpStatusCode)businessException.ErrorCode;
                message = businessException.Message;
                _logger.LogWarning(businessException, "Business error: {Message}", message);
                break;
            default:
                status = HttpStatusCode.InternalServerError;
                message = "服务器内部错误";
                _logger.LogError(exception, "Unhandled exception: {Message}", exception.Message);
                break;
        }

        context.Response.StatusCode = (int)status;
        context.Response.ContentType = "application/json";

        var response = new
        {
            error = true,
            code = (int)status,
            message,
            timestamp = DateTime.UtcNow
        };

        var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(jsonResponse);
    }
}
