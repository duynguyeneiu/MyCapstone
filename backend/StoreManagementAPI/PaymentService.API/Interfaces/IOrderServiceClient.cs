using PaymentService.API.DTOs.Order;

namespace PaymentService.API.Interfaces
{
    public interface IOrderServiceClient
    {
        Task<OrderDto?> GetOrderAsync(int orderId);
        Task UpdatePaymentStatusAsync(int orderId, string paymentStatus);
    }
}
