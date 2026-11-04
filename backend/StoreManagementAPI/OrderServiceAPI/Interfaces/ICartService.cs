using OrderServiceAPI.DTOs.Cart;

namespace OrderServiceAPI.Interfaces
{
    public interface ICartService
    {
        Task<CartDto> GetCartAsync(int userId);
        Task<CartDto> AddItemAsync(AddCartItemRequest request);
        Task<CartDto> UpdateItemAsync(int userId,int cartDetailId, UpdateCartItemRequest request);
        Task<CartDto> RemoveItemAsync(int userId,int cartDetailId);

        Task ClearCartAsync(int userId);
    }
}
