using PaymentService.API.DTOs.Order;
using PaymentService.API.Interfaces;
using System.Net;

namespace PaymentService.API.Services
{
    public class OrderServiceClient : IOrderServiceClient
    {
        private readonly HttpClient _httpClient;

        public OrderServiceClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<OrderDto?> GetOrderAsync(int orderId)
        {
            var response =
                await _httpClient.GetAsync(
                    $"api/Order/{orderId}");

            if (response.StatusCode == HttpStatusCode.NotFound)
            {
                return null;
            }

            response.EnsureSuccessStatusCode();

            return await response.Content
                .ReadFromJsonAsync<OrderDto>();
        }

        public async Task UpdatePaymentStatusAsync(int orderId, string paymentStatus)
        {
            var response = await _httpClient.PutAsJsonAsync(
                $"api/Order/{orderId}/payment-status",
                new { paymentStatus });

            response.EnsureSuccessStatusCode();
        }
    }
}
