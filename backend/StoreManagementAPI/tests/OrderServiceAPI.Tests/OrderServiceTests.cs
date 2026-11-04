using Moq;
using OrderServiceAPI.DTOs;
using OrderServiceAPI.DTOs.Order;
using OrderServiceAPI.Interfaces;
using OrderServiceAPI.Models;
using OrderServiceAPI.Services;
using CatalogProduct = OrderServiceAPI.DTOs.Product.ProductDto;
using OrderEntity = OrderServiceAPI.Models.Order;

namespace OrderServiceAPI.Tests;

public class OrderServiceTests
{
    private readonly Mock<IOrderRepository> _orderRepo = new();
    private readonly Mock<ICartRepository> _cartRepo = new();
    private readonly Mock<ICatalogServiceClient> _catalog = new();
    private readonly OrderService _sut;

    public OrderServiceTests()
    {
        _sut = new OrderService(_orderRepo.Object, _cartRepo.Object, _catalog.Object);
    }

    // ---------- helpers ----------

    private static Cart CartWith(params (int productId, int qty)[] items)
    {
        var cart = new Cart { CartId = 7, UserId = 1 };
        foreach (var (productId, qty) in items)
            cart.CartDetails.Add(new CartDetail { CartId = 7, ProductId = productId, Quantity = qty });
        return cart;
    }

    private void ProductExists(int id, decimal price, int stock, string name = "Product")
    {
        _catalog.Setup(c => c.GetProductAsync(id)).ReturnsAsync(new CatalogProduct
        {
            ProductId = id,
            ProductName = name,
            Price = price,
            StockQuantity = stock,
            Status = "Active"
        });
    }

    private static OrderEntity NewOrder(
        int id, int? customerId, string status, params (int productId, int qty)[] items)
    {
        var order = new OrderEntity
        {
            OrderId = id,
            OrderNumber = $"ORD-{id}",
            CustomerUserId = customerId,
            ReceiverName = "Nguyen Duy",
            ReceiverPhone = "0912345678",
            OrderType = "ONLINE",
            PaymentMethod = "COD",
            PaymentStatus = "Pending",
            OrderStatus = status
        };
        foreach (var (productId, qty) in items)
        {
            order.OrderDetails.Add(new OrderDetail
            {
                OrderId = id,
                ProductId = productId,
                ProductName = $"Product {productId}",
                Quantity = qty,
                UnitPrice = 1000,
                Subtotal = 1000 * qty
            });
        }
        return order;
    }

    private static CheckoutRequest NewCheckout() => new()
    {
        UserId = 1,
        ReceiverName = "Nguyen Duy",
        ReceiverPhone = "0912345678",
        ShippingAddress = "Thu Dau Mot, Binh Duong",
        PaymentMethod = "COD"
    };

    // ---------- Online checkout ----------

    [Fact]
    public async Task CheckoutAsync_CartNotFound_ThrowsArgumentException()
    {
        _cartRepo.Setup(r => r.GetCartByUserIdAsync(1)).ReturnsAsync((Cart?)null);

        await Assert.ThrowsAsync<ArgumentException>(() => _sut.CheckoutAsync(NewCheckout()));
    }

    [Fact]
    public async Task CheckoutAsync_EmptyCart_ThrowsArgumentException()
    {
        _cartRepo.Setup(r => r.GetCartByUserIdAsync(1)).ReturnsAsync(CartWith());

        await Assert.ThrowsAsync<ArgumentException>(() => _sut.CheckoutAsync(NewCheckout()));
        _orderRepo.Verify(r => r.AddOrderAsync(It.IsAny<OrderEntity>()), Times.Never);
    }

    [Fact]
    public async Task CheckoutAsync_ProductNoLongerExists_ThrowsKeyNotFoundException()
    {
        _cartRepo.Setup(r => r.GetCartByUserIdAsync(1)).ReturnsAsync(CartWith((10, 1)));
        _catalog.Setup(c => c.GetProductAsync(10)).ReturnsAsync((CatalogProduct?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _sut.CheckoutAsync(NewCheckout()));
    }

    [Fact]
    public async Task CheckoutAsync_ProductOutOfStock_ThrowsInvalidOperationException()
    {
        _cartRepo.Setup(r => r.GetCartByUserIdAsync(1)).ReturnsAsync(CartWith((10, 5)));
        ProductExists(10, price: 10000, stock: 2);

        await Assert.ThrowsAsync<InvalidOperationException>(() => _sut.CheckoutAsync(NewCheckout()));
        _orderRepo.Verify(r => r.AddOrderAsync(It.IsAny<OrderEntity>()), Times.Never);
    }

    [Fact]
    public async Task CheckoutAsync_ValidCart_AddsShippingFeeAndClearsCart()
    {
        _cartRepo.Setup(r => r.GetCartByUserIdAsync(1)).ReturnsAsync(CartWith((10, 2), (11, 1)));
        ProductExists(10, price: 10000, stock: 50, name: "Milk");
        ProductExists(11, price: 5000, stock: 50, name: "Bread");

        var result = await _sut.CheckoutAsync(NewCheckout());

        Assert.Equal(25000m, result.TotalAmount);   // 2 x 10.000 + 1 x 5.000
        Assert.Equal(30000m, result.ShippingFee);
        Assert.Equal(55000m, result.FinalAmount);
        Assert.Equal("ONLINE", result.OrderType);
        Assert.Equal("Pending", result.OrderStatus);
        Assert.Equal("Pending", result.PaymentStatus);
        Assert.Equal(2, result.Items.Count);
        Assert.Contains(result.Items, i => i.ProductName == "Milk" && i.Subtotal == 20000m);

        _orderRepo.Verify(r => r.AddOrderAsync(It.IsAny<OrderEntity>()), Times.Once);
        _cartRepo.Verify(r => r.RemoveAllItemsAsync(7), Times.Once);
    }

    [Fact]
    public async Task CheckoutAsync_ValidCart_DoesNotDeductStockBeforeConfirmation()
    {
        _cartRepo.Setup(r => r.GetCartByUserIdAsync(1)).ReturnsAsync(CartWith((10, 2)));
        ProductExists(10, price: 10000, stock: 50);

        await _sut.CheckoutAsync(NewCheckout());

        _catalog.Verify(c => c.UpdateStockAsync(It.IsAny<int>(), It.IsAny<int>()), Times.Never);
    }

    // ---------- POS checkout ----------

    [Fact]
    public async Task CheckoutPosAsync_NoItems_ThrowsArgumentException()
    {
        var request = new PosCheckoutRequest { PaymentMethod = "Cash" };

        await Assert.ThrowsAsync<ArgumentException>(() => _sut.CheckoutPosAsync(request));
    }

    [Fact]
    public async Task CheckoutPosAsync_ValidItems_PaidCompletedAndDeductsStockImmediately()
    {
        ProductExists(10, price: 10000, stock: 5);
        var request = new PosCheckoutRequest
        {
            StaffUserId = 3,
            PaymentMethod = "Cash",
            Items = [new PosOrderItem { ProductId = 10, Quantity = 2 }]
        };

        var result = await _sut.CheckoutPosAsync(request);

        Assert.Equal("POS", result.OrderType);
        Assert.Equal("Paid", result.PaymentStatus);
        Assert.Equal("Completed", result.OrderStatus);
        Assert.Equal(0m, result.ShippingFee);
        Assert.Equal(20000m, result.FinalAmount);
        Assert.Equal("Walk-in Customer", result.ReceiverName);

        _orderRepo.Verify(r => r.AddOrderAsync(It.Is<OrderEntity>(o =>
            o.StaffUserId == 3 && o.CustomerUserId == null)), Times.Once);
        _catalog.Verify(c => c.UpdateStockAsync(10, 2), Times.Once);
    }

    [Fact]
    public async Task CheckoutPosAsync_OutOfStock_DoesNotCreateOrderOrDeductStock()
    {
        ProductExists(10, price: 10000, stock: 1);
        var request = new PosCheckoutRequest
        {
            PaymentMethod = "Cash",
            Items = [new PosOrderItem { ProductId = 10, Quantity = 3 }]
        };

        await Assert.ThrowsAsync<InvalidOperationException>(() => _sut.CheckoutPosAsync(request));
        _orderRepo.Verify(r => r.AddOrderAsync(It.IsAny<OrderEntity>()), Times.Never);
        _catalog.Verify(c => c.UpdateStockAsync(It.IsAny<int>(), It.IsAny<int>()), Times.Never);
    }

    // ---------- Cancel ----------

    [Fact]
    public async Task CancelOrderAsync_OrderDoesNotExist_ThrowsKeyNotFoundException()
    {
        _orderRepo.Setup(r => r.GetOrderByIdAsync(5)).ReturnsAsync((OrderEntity?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _sut.CancelOrderAsync(5, 1, isStaff: false));
    }

    [Fact]
    public async Task CancelOrderAsync_OrderOfAnotherCustomer_ThrowsUnauthorizedAccessException()
    {
        _orderRepo.Setup(r => r.GetOrderByIdAsync(5)).ReturnsAsync(NewOrder(5, customerId: 2, "Pending"));

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => _sut.CancelOrderAsync(5, 1, isStaff: false));
        _orderRepo.Verify(r => r.SaveChangesAsync(), Times.Never);
    }

    [Fact]
    public async Task CancelOrderAsync_OrderNotPending_ThrowsInvalidOperationException()
    {
        _orderRepo.Setup(r => r.GetOrderByIdAsync(5)).ReturnsAsync(NewOrder(5, customerId: 1, "Completed"));

        await Assert.ThrowsAsync<InvalidOperationException>(() => _sut.CancelOrderAsync(5, 1, isStaff: false));
    }

    [Fact]
    public async Task CancelOrderAsync_OwnPendingOrder_SetsStatusCancelled()
    {
        var order = NewOrder(5, customerId: 1, "Pending");
        _orderRepo.Setup(r => r.GetOrderByIdAsync(5)).ReturnsAsync(order);

        await _sut.CancelOrderAsync(5, 1, isStaff: false);

        Assert.Equal("Cancelled", order.OrderStatus);
        _orderRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task CancelOrderAsync_StaffCanCancelAnyPendingOrder()
    {
        var order = NewOrder(5, customerId: 2, "Pending");
        _orderRepo.Setup(r => r.GetOrderByIdAsync(5)).ReturnsAsync(order);

        await _sut.CancelOrderAsync(5, userId: 99, isStaff: true);

        Assert.Equal("Cancelled", order.OrderStatus);
    }

    // ---------- Status ----------

    [Fact]
    public async Task UpdateStatusAsync_Confirmed_DeductsStockForEveryItem()
    {
        var order = NewOrder(5, customerId: 1, "Pending", (10, 2), (11, 1));
        _orderRepo.Setup(r => r.GetOrderByIdAsync(5)).ReturnsAsync(order);

        await _sut.UpdateStatusAsync(5, new UpdateOrderStatusRequest { Status = "Confirmed" });

        Assert.Equal("Confirmed", order.OrderStatus);
        _catalog.Verify(c => c.UpdateStockAsync(10, 2), Times.Once);
        _catalog.Verify(c => c.UpdateStockAsync(11, 1), Times.Once);
        _orderRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task UpdateStatusAsync_Shipping_DoesNotTouchStock()
    {
        var order = NewOrder(5, customerId: 1, "Confirmed", (10, 2));
        _orderRepo.Setup(r => r.GetOrderByIdAsync(5)).ReturnsAsync(order);

        await _sut.UpdateStatusAsync(5, new UpdateOrderStatusRequest { Status = "Shipping" });

        Assert.Equal("Shipping", order.OrderStatus);
        _catalog.Verify(c => c.UpdateStockAsync(It.IsAny<int>(), It.IsAny<int>()), Times.Never);
    }

    [Fact]
    public async Task UpdatePaymentStatusAsync_ExistingOrder_UpdatesPaymentStatus()
    {
        var order = NewOrder(5, customerId: 1, "Pending");
        _orderRepo.Setup(r => r.GetOrderByIdAsync(5)).ReturnsAsync(order);

        await _sut.UpdatePaymentStatusAsync(5, "Paid");

        Assert.Equal("Paid", order.PaymentStatus);
        _orderRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task GetOrderByIdAsync_OrderDoesNotExist_ThrowsKeyNotFoundException()
    {
        _orderRepo.Setup(r => r.GetOrderByIdAsync(404)).ReturnsAsync((OrderEntity?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _sut.GetOrderByIdAsync(404));
    }
}
