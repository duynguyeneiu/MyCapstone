using PaymentService.API.DTOs.Order;

namespace PaymentService.API.Interfaces
{
    public interface IOrderServiceClient
    {
        Task<OrderDto?> GetOrderAsync(int orderId);
    }
}
