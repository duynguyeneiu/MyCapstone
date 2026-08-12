using Microsoft.EntityFrameworkCore;
using PaymentService.API.Data;
using PaymentService.API.Interfaces;
using PaymentService.API.Repositories;
using PaymentService.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
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

builder.Services.AddHttpClient<
    IOrderServiceClient,
    OrderServiceClient>(client =>
    {
        client.BaseAddress = new Uri(
            builder.Configuration[
                "Services:OrderService"]);
    });
builder.WebHost.UseUrls(
    "http://localhost:5004"
  );

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();