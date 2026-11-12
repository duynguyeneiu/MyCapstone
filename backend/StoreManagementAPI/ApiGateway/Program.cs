using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Routes / clusters are read from appsettings.json -> "ReverseProxy"
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

// Global rate limit per client IP (UserService still keeps its own 5/min limit for login/OTP)
builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    o.AddPolicy("per-ip", ctx => RateLimitPartition.GetFixedWindowLimiter(
        ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 300, Window = TimeSpan.FromMinutes(1) }));
});

var app = builder.Build();

app.UseRateLimiter();
app.MapGet("/", () => "HappyMart API Gateway is running");
app.MapReverseProxy();

app.Run();