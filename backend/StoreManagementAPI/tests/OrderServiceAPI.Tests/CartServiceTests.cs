using Moq;
using OrderServiceAPI.DTOs.Cart;
using OrderServiceAPI.Interfaces;
using OrderServiceAPI.Models;
using OrderServiceAPI.Services;
using CatalogProduct = OrderServiceAPI.DTOs.Product.ProductDto;

namespace OrderServiceAPI.Tests;

public class CartServiceTests
{
    private readonly Mock<ICartRepository> _repo = new();
    private readonly Mock<ICatalogServiceClient> _catalog = new();
    private readonly CartService _sut;

    public CartServiceTests()
    {
        _sut = new CartService(_repo.Object, _catalog.Object);
    }

    private static Cart NewCart(int userId = 1) => new() { CartId = 7, UserId = userId };

    private void ProductExists(int id, decimal price, int stock)
    {
        _catalog.Setup(c => c.GetProductAsync(id)).ReturnsAsync(new CatalogProduct
        {
            ProductId = id,
            ProductName = "Milk",
            Price = price,
            StockQuantity = stock,
            Status = "Active"
        });
    }

    [Fact]
    public async Task AddItemAsync_ProductDoesNotExist_ThrowsKeyNotFoundException()
    {
        _repo.Setup(r => r.GetCartByUserIdAsync(1)).ReturnsAsync(NewCart());
        _catalog.Setup(c => c.GetProductAsync(10)).ReturnsAsync((CatalogProduct?)null);

        var request = new AddCartItemRequest { UserId = 1, ProductId = 10, Quantity = 1 };

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _sut.AddItemAsync(request));
    }

    [Fact]
    public async Task AddItemAsync_TotalQuantityExceedsStock_ThrowsInvalidOperationException()
    {
        _repo.Setup(r => r.GetCartByUserIdAsync(1)).ReturnsAsync(NewCart());
        _repo.Setup(r => r.GetCartItemAsync(7, 10))
            .ReturnsAsync(new CartDetail { CartId = 7, ProductId = 10, Quantity = 3 });
        ProductExists(10, price: 12000, stock: 5);

        // 3 already in cart + 3 requested = 6 > 5 in stock
        var request = new AddCartItemRequest { UserId = 1, ProductId = 10, Quantity = 3 };

        await Assert.ThrowsAsync<InvalidOperationException>(() => _sut.AddItemAsync(request));
        _repo.Verify(r => r.SaveChangesAsync(), Times.Never);
    }

    [Fact]
    public async Task AddItemAsync_NewProduct_AddsItemWithCorrectSubtotal()
    {
        CartDetail? added = null;
        _repo.Setup(r => r.GetCartByUserIdAsync(1)).ReturnsAsync(NewCart());
        _repo.Setup(r => r.GetCartItemAsync(7, 10)).ReturnsAsync((CartDetail?)null);
        _repo.Setup(r => r.AddCartItemAsync(It.IsAny<CartDetail>()))
            .Callback<CartDetail>(d => added = d)
            .Returns(Task.CompletedTask);
        ProductExists(10, price: 12000, stock: 10);

        await _sut.AddItemAsync(new AddCartItemRequest { UserId = 1, ProductId = 10, Quantity = 3 });

        Assert.NotNull(added);
        Assert.Equal(3, added!.Quantity);
        Assert.Equal(12000m, added.UnitPrice);
        Assert.Equal(36000m, added.Subtotal);
        _repo.Verify(r => r.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task AddItemAsync_ProductAlreadyInCart_IncreasesQuantity()
    {
        var existing = new CartDetail { CartId = 7, ProductId = 10, Quantity = 2, UnitPrice = 12000 };
        _repo.Setup(r => r.GetCartByUserIdAsync(1)).ReturnsAsync(NewCart());
        _repo.Setup(r => r.GetCartItemAsync(7, 10)).ReturnsAsync(existing);
        ProductExists(10, price: 12000, stock: 10);

        await _sut.AddItemAsync(new AddCartItemRequest { UserId = 1, ProductId = 10, Quantity = 1 });

        Assert.Equal(3, existing.Quantity);
        Assert.Equal(36000m, existing.Subtotal);
        _repo.Verify(r => r.AddCartItemAsync(It.IsAny<CartDetail>()), Times.Never);
    }

    [Fact]
    public async Task AddItemAsync_UserHasNoCart_CreatesCartFirst()
    {
        _repo.SetupSequence(r => r.GetCartByUserIdAsync(1))
            .ReturnsAsync((Cart?)null)
            .ReturnsAsync(NewCart());
        _repo.Setup(r => r.CreateCartAsync(1)).ReturnsAsync(NewCart());
        ProductExists(10, price: 12000, stock: 10);

        await _sut.AddItemAsync(new AddCartItemRequest { UserId = 1, ProductId = 10, Quantity = 1 });

        _repo.Verify(r => r.CreateCartAsync(1), Times.Once);
    }

    [Fact]
    public async Task UpdateItemAsync_ItemBelongsToAnotherUser_ThrowsUnauthorizedAccessException()
    {
        _repo.Setup(r => r.GetCartItemByIdAsync(50)).ReturnsAsync(new CartDetail
        {
            CartDetailId = 50,
            ProductId = 10,
            Quantity = 1,
            Cart = NewCart(userId: 2)
        });

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            _sut.UpdateItemAsync(1, 50, new UpdateCartItemRequest { Quantity = 2 }));
        _repo.Verify(r => r.SaveChangesAsync(), Times.Never);
    }

    [Fact]
    public async Task RemoveItemAsync_ItemBelongsToAnotherUser_ThrowsUnauthorizedAccessException()
    {
        _repo.Setup(r => r.GetCartItemByIdAsync(50)).ReturnsAsync(new CartDetail
        {
            CartDetailId = 50,
            Cart = NewCart(userId: 2)
        });

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _sut.RemoveItemAsync(1, 50));
        _repo.Verify(r => r.RemoveCartItemAsync(It.IsAny<CartDetail>()), Times.Never);
    }

    [Fact]
    public async Task RemoveItemAsync_OwnItem_RemovesAndSaves()
    {
        var item = new CartDetail { CartDetailId = 50, Cart = NewCart(userId: 1) };
        _repo.Setup(r => r.GetCartItemByIdAsync(50)).ReturnsAsync(item);
        _repo.Setup(r => r.GetCartByUserIdAsync(1)).ReturnsAsync(NewCart());

        await _sut.RemoveItemAsync(1, 50);

        _repo.Verify(r => r.RemoveCartItemAsync(item), Times.Once);
        _repo.Verify(r => r.SaveChangesAsync(), Times.Once);
    }
}
