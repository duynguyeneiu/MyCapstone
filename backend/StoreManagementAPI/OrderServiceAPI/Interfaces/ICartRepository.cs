using OrderServiceAPI.Models;

namespace OrderServiceAPI.Interfaces
{
    public interface ICartRepository
    {
        Task<Cart?> GetCartByUserIdAsync(int userId);

        Task<Cart?> CreateCartAsync(int userId);

        Task SaveChangesAsync();
        Task<CartDetail?> GetCartItemAsync(int cartId, int productId);

        Task AddCartItemAsync(CartDetail item);

        Task<CartDetail?> GetCartItemByIdAsync(int cartDetailId);
        Task RemoveCartItemAsync(CartDetail cartItem);
        Task RemoveAllItemsAsync(int cartId);
    }
}
