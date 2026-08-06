using Microsoft.EntityFrameworkCore;
using OrderServiceAPI.Data;
using OrderServiceAPI.Interfaces;
using OrderServiceAPI.Models;

namespace OrderServiceAPI.Repositories
{
    public class CartRepository : ICartRepository
    {
        private readonly OrderDbContext _context;

        public CartRepository(OrderDbContext context)
        {
            _context = context;
        }

        public async Task<Cart?> GetCartByUserIdAsync(int userId)
        {
            return await _context.Carts
                .Include(c => c.CartDetails)
                .FirstOrDefaultAsync(c => c.UserId == userId);
        }

        public async Task<Cart?> CreateCartAsync(int userId)
        {
            var cart = new Cart
            {
                UserId = userId
            };

            _context.Carts.Add(cart);

            await _context.SaveChangesAsync();

            return cart;
        }
        public async Task<CartDetail?> GetCartItemAsync(int cartId, int productId)
        {
            return await _context.CartDetails
                .FirstOrDefaultAsync(x =>
                    x.CartId == cartId &&
                    x.ProductId == productId);
        }

        public async Task AddCartItemAsync(CartDetail cartItem)
        {
            await _context.CartDetails.AddAsync(cartItem);
        }

       

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
        public async Task<CartDetail?> GetCartItemByIdAsync(int cartDetailId)
        {
            return await _context.CartDetails
                .Include(x => x.Cart)
                .FirstOrDefaultAsync(x => x.CartDetailId == cartDetailId);
        }
        public Task RemoveCartItemAsync(CartDetail cartItem)
        {
            _context.CartDetails.Remove(cartItem);
            return Task.CompletedTask;
        }

        public async Task RemoveAllItemsAsync(int cartId)
        {
            var items = await _context.CartDetails
                .Where(x => x.CartId == cartId)
                .ToListAsync();

            _context.CartDetails.RemoveRange(items);
        }
    }
}
