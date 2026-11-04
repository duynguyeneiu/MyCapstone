using System.Net;
using System.Text.Json;

namespace UserService.API.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
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
            var status = ex switch
            {
                KeyNotFoundException => HttpStatusCode.NotFound,      // 404
                ArgumentException => HttpStatusCode.BadRequest,    // 400
                InvalidOperationException => HttpStatusCode.Conflict,      // 409
                UnauthorizedAccessException => HttpStatusCode.Forbidden,     // 403
                HttpRequestException => HttpStatusCode.BadGateway,    // 502: service khác không phản hồi
                _ => HttpStatusCode.InternalServerError
            };

            if (status == HttpStatusCode.InternalServerError)
                _logger.LogError(ex, "Unhandled exception");

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)status;

            var message = status == HttpStatusCode.InternalServerError
                ? "Internal server error."   // không trả chi tiết lỗi 500 ra ngoài
                : ex.Message;

            await context.Response.WriteAsync(JsonSerializer.Serialize(
                new { statusCode = (int)status, message }));
        }
    }
}