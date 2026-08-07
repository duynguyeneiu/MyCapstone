using OrderServiceAPI.Models;

namespace OrderServiceAPI.Interfaces
{
    public interface IOrderRepository
    {
        Task AddOrderAsync(Order order);

        Task AddOrderDetailRangeAsync(List<OrderDetail> details);

        Task SaveChangesAsync();

        Task<List<Order>> GetOrdersByUserIdAsync(int userId);
        Task<List<Order>> GetAllOrdersAsync();
        Task<Order?> GetOrderByIdAsync(int orderId);



    }
}
