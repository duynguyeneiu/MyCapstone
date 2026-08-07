using OrderServiceAPI.DTOs;
using OrderServiceAPI.DTOs.Order;

namespace OrderServiceAPI.Interfaces
{
    public interface IOrderService
    {
        Task<OrderDto> CheckoutAsync(CheckoutRequest request);
        Task<List<OrderDto>> GetOrdersByUserIdAsync(int userId);
        Task<List<OrderDto>> GetAllOrdersAsync();

        Task<OrderDto> GetOrderByIdAsync(int orderId);
        Task CancelOrderAsync(int orderId);
        Task UpdateStatusAsync(int orderId, UpdateOrderStatusRequest request);
    }
}
