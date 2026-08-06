using OrderServiceAPI.DTOs.Cart;
using OrderServiceAPI.Interfaces;
using OrderServiceAPI.Models;

namespace OrderServiceAPI.Services
{
    public class CartService : ICartService
    {
        private readonly ICartRepository _repository;
        private readonly ICatalogServiceClient _catalogClient;

        public CartService(
            ICartRepository repository,
            ICatalogServiceClient catalogClient)
        {
            _repository = repository;
            _catalogClient = catalogClient;
        }

   

        public async Task<CartDto> GetCartAsync(int userId)
        {
            var cart = await _repository.GetCartByUserIdAsync(userId);

            if (cart == null)
            {
                cart = await _repository.CreateCartAsync(userId);
            }

            return MapToDto(cart);
        }

        private static CartDto MapToDto(Cart cart)
        {
            return new CartDto
            {
                CartId = cart.CartId,

                UserId = cart.UserId,

                TotalAmount = cart.CartDetails.Sum(x => x.Subtotal),

                Items = cart.CartDetails.Select(x => new CartItemDto
                {
                    CartDetailId = x.CartDetailId,

                    ProductId = x.ProductId,

                    Quantity = x.Quantity,

                    UnitPrice = x.UnitPrice,

                    Subtotal = x.Subtotal

                }).ToList()
            };
        }

        public async Task<CartDto> AddItemAsync(AddCartItemRequest request)
        {
            // Lấy cart
            var cart = await _repository.GetCartByUserIdAsync(request.UserId);

            if (cart == null)
            {
                cart = await _repository.CreateCartAsync(request.UserId);
            }

            // Kiểm tra sản phẩm
            var product = await _catalogClient.GetProductAsync(request.ProductId);

            if (product == null)
                throw new Exception("Product not found.");

            // Lấy cart item
            var cartItem = await _repository.GetCartItemAsync(cart.CartId, request.ProductId);

            // Kiểm tra tồn kho
            var totalQuantity = request.Quantity + (cartItem?.Quantity ?? 0);

            if (product.StockQuantity < totalQuantity)
                throw new Exception("Out of stock.");

            if (cartItem == null)
            {
                cartItem = new CartDetail
                {
                    CartId = cart.CartId,
                    ProductId = request.ProductId,
                    Quantity = request.Quantity,
                    UnitPrice = product.Price,
                    Subtotal = product.Price * request.Quantity,
                    AddedAt = DateTime.Now,
                    CreatedAt = DateTime.Now
                };

                await _repository.AddCartItemAsync(cartItem);
            }
            else
            {
                cartItem.Quantity += request.Quantity;
                cartItem.UnitPrice = product.Price;
                cartItem.Subtotal = cartItem.Quantity * cartItem.UnitPrice;
                cartItem.UpdatedAt = DateTime.Now;
            }

            await _repository.SaveChangesAsync();

            cart = await _repository.GetCartByUserIdAsync(request.UserId);

            return MapToDto(cart!);
        }
        public async Task<CartDto> UpdateItemAsync(int cartDetailId, UpdateCartItemRequest request)
        {
            var cartItem = await _repository.GetCartItemByIdAsync(cartDetailId);

            if (cartItem == null)
                throw new Exception("Cart item not found.");

            var product = await _catalogClient.GetProductAsync(cartItem.ProductId);

            if (product == null)
                throw new Exception("Product not found.");

            if (product.StockQuantity < request.Quantity)
                throw new Exception("Out of stock.");

            cartItem.Quantity = request.Quantity;
            cartItem.UnitPrice = product.Price;
            cartItem.Subtotal = product.Price * request.Quantity;
            cartItem.UpdatedAt = DateTime.Now;

            await _repository.SaveChangesAsync();

            var cart = await _repository.GetCartByUserIdAsync(cartItem.Cart.UserId);

            return MapToDto(cart!);
        }
        public async Task<CartDto> RemoveItemAsync(int cartDetailId)
        {
            var cartItem = await _repository.GetCartItemByIdAsync(cartDetailId);

            if (cartItem == null)
                throw new Exception("Cart item not found.");

            var userId = cartItem.Cart.UserId;

            await _repository.RemoveCartItemAsync(cartItem);
            await _repository.SaveChangesAsync();

            var cart = await _repository.GetCartByUserIdAsync(userId);

            return MapToDto(cart!);
        }


        public async Task ClearCartAsync(int userId)
        {
            var cart = await _repository.GetCartByUserIdAsync(userId);

            if (cart == null)
                return;

            await _repository.RemoveAllItemsAsync(cart.CartId);

            await _repository.SaveChangesAsync();
        }
    }
}
