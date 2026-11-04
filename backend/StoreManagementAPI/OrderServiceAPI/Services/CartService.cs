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

            return await MapToDto(cart);
        }

        private async Task<CartDto> MapToDto(Cart cart)
{
    var dto = new CartDto
    {
        CartId = cart.CartId,
        UserId = cart.UserId,
        TotalAmount = cart.CartDetails.Sum(x => x.Subtotal),
        Items = new List<CartItemDto>()
    };

    foreach (var item in cart.CartDetails)
    {
        var product = await _catalogClient.GetProductAsync(item.ProductId);

        dto.Items.Add(new CartItemDto
        {
            CartDetailId = item.CartDetailId,
            ProductId = item.ProductId,
            ProductName = product?.ProductName ?? "",
            ImageUrl = product?.ImageUrl,
            Quantity = item.Quantity,
            UnitPrice = item.UnitPrice,
            Subtotal = item.Subtotal
        });
    }

    return dto;
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
                throw new KeyNotFoundException("Product not found.");

            // Lấy cart item
            var cartItem = await _repository.GetCartItemAsync(cart.CartId, request.ProductId);

            // Kiểm tra tồn kho
            var totalQuantity = request.Quantity + (cartItem?.Quantity ?? 0);

            if (product.StockQuantity < totalQuantity)
                throw new InvalidOperationException("Out of stock.");

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

            return await  MapToDto(cart!);
        }
        public async Task<CartDto> UpdateItemAsync(int userId, int cartDetailId, UpdateCartItemRequest request)
        {
            var cartItem = await _repository.GetCartItemByIdAsync(cartDetailId);

            if (cartItem == null)
                throw new KeyNotFoundException("Cart item not found.");
            if (cartItem.Cart.UserId != userId)
                throw new UnauthorizedAccessException("This cart item does not belong to you.");
            var product = await _catalogClient.GetProductAsync(cartItem.ProductId);

            if (product == null)
                throw new KeyNotFoundException("Product not found.");

            if (product.StockQuantity < request.Quantity)
                throw new InvalidOperationException("Out of stock.");

            cartItem.Quantity = request.Quantity;
            cartItem.UnitPrice = product.Price;
            cartItem.Subtotal = product.Price * request.Quantity;
            cartItem.UpdatedAt = DateTime.Now;

            await _repository.SaveChangesAsync();

            var cart = await _repository.GetCartByUserIdAsync(cartItem.Cart.UserId);

            return await  MapToDto(cart!);
        }
        public async Task<CartDto> RemoveItemAsync(int userId, int cartDetailId)
        {
            var cartItem = await _repository.GetCartItemByIdAsync(cartDetailId);

            if (cartItem == null)
                throw new KeyNotFoundException("Cart item not found.");

            if (cartItem.Cart.UserId != userId)
                throw new UnauthorizedAccessException("This cart item does not belong to you.");

            await _repository.RemoveCartItemAsync(cartItem);
            await _repository.SaveChangesAsync();

            var cart = await _repository.GetCartByUserIdAsync(userId);

            return await MapToDto(cart!);
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
