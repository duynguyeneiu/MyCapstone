using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PaymentService.API.Data;
using PaymentService.API.Interfaces;
using PaymentService.API.Middleware;
using PaymentService.API.Models;
using PaymentService.API.Repositories;
using PaymentService.API.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();

builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<PaymentDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString(
            "PaymentDatabase")));

builder.Services.AddScoped<
    IPaymentRepository,
    PaymentRepository>();

builder.Services.AddScoped<
    IPaymentService,
    PaymentsService>();

builder.Services.Configure<VnPayOptions>(
    builder.Configuration.GetSection("VnPay"));

builder.Services.AddScoped<IVnPayService, VnPayService>();
builder.Services.Configure<MoMoOptions>(
    builder.Configuration.GetSection("MoMo"));

builder.Services.AddHttpClient<IMoMoService, MoMoService>();

builder.Services.AddHttpClient<
    IOrderServiceClient,
    OrderServiceClient>(client =>
    {
        client.BaseAddress = new Uri(
            builder.Configuration["Services:OrderService"]);
        client.DefaultRequestHeaders.Add("X-Internal-Key", builder.Configuration["InternalApi:Key"]);
    });
// =====================================================
// JWT Authentication
// =====================================================

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,

                ValidIssuer =
                    builder.Configuration["Jwt:Issuer"],

                ValidAudience =
                    builder.Configuration["Jwt:Audience"],

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(
                            builder.Configuration["Jwt:Key"]!
                        )
                    )
            };
    });

// =====================================================
// Authorization
// =====================================================

builder.Services.AddAuthorization();

var app = builder.Build();
app.UseMiddleware<ExceptionMiddleware>();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();


app.UseCors("AllowFrontend");

// Authentication phải trước Authorization
app.UseAuthentication();
app.UseAuthorization();


app.MapControllers();

app.Run();