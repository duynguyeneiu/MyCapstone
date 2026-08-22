using OrderServiceAPI.DTOs;
using OrderServiceAPI.DTOs.Order;
using OrderServiceAPI.Interfaces;
using OrderServiceAPI.Models;

namespace OrderServiceAPI.Services
{
    public class OrderService: IOrderService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly ICartRepository _cartRepository;
        private readonly ICatalogServiceClient _catalogClient;
        public OrderService(
    IOrderRepository orderRepository,
    ICartRepository cartRepository,
    ICatalogServiceClient catalogClient)
        {
            _orderRepository = orderRepository;
            _cartRepository = cartRepository;
            _catalogClient = catalogClient;
        }

        public async Task<OrderDto> CheckoutAsync(CheckoutRequest request)
        {
            // Lấy giỏ hàng
            var cart = await _cartRepository.GetCartByUserIdAsync(request.UserId);

            if (cart == null || !cart.CartDetails.Any())
                throw new Exception("Cart is empty.");

            decimal totalAmount = 0;
            var productNames = new Dictionary<int, string>();

            // Kiểm tra tồn kho và cập nhật giá
            foreach (var item in cart.CartDetails)
            {
                var product = await _catalogClient.GetProductAsync(item.ProductId);

                if (product == null)
                    throw new Exception($"Product {item.ProductId} not found.");

                if (product.StockQuantity < item.Quantity)
                    throw new Exception($"Product {item.ProductId} is out of stock.");

                item.UnitPrice = product.Price;
                item.Subtotal = product.Price * item.Quantity;
                productNames[item.ProductId] = product.ProductName;

                totalAmount += item.Subtotal;
            }

            const decimal shippingFee = 30000;

            var finalAmount = totalAmount + shippingFee;

            // Tạo Order
            var order = new Order
            {
                OrderNumber = $"ORD-{DateTime.Now:yyyyMMddHHmmssfff}",
                CustomerUserId = request.UserId,
                ReceiverName = request.ReceiverName,
                ReceiverPhone = request.ReceiverPhone,
                ShippingAddress = request.ShippingAddress,
                OrderType = "ONLINE",
                PaymentMethod = request.PaymentMethod,
                PaymentStatus = "Pending",
                OrderStatus = "Pending",
                TotalAmount = totalAmount,
                Discount = 0,
                Vat = 0,
                ShippingFee = shippingFee,
                FinalAmount = finalAmount,
                CreatedAt = DateTime.Now,
                OrderDate = DateTime.Now
            };

            await _orderRepository.AddOrderAsync(order);
            await _orderRepository.SaveChangesAsync();

            // Tạo OrderDetail
            var orderDetails = cart.CartDetails.Select(item => new OrderDetail
            {
                OrderId = order.OrderId,
                ProductId = item.ProductId,
                ProductName = productNames[item.ProductId],
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                Subtotal = item.Subtotal,
                CreatedAt = DateTime.Now
            }).ToList();

            await _orderRepository.AddOrderDetailRangeAsync(orderDetails);
            await _orderRepository.SaveChangesAsync();

            // Xóa giỏ hàng
            await _cartRepository.RemoveAllItemsAsync(cart.CartId);
            await _cartRepository.SaveChangesAsync();

            // Trả kết quả
            return new OrderDto
            {
                OrderId = order.OrderId,
                OrderNumber = order.OrderNumber,
                UserId = order.CustomerUserId ?? 0,
                OrderDate = order.OrderDate,
                TotalAmount = order.TotalAmount,
                OrderType = order.OrderType,
                ReceiverName = order.ReceiverName,
                ReceiverPhone = order.ReceiverPhone,
                PaymentMethod = order.PaymentMethod,
                PaymentStatus = order.PaymentStatus,
                OrderStatus = order.OrderStatus,
                ShippingAddress = order.ShippingAddress ?? string.Empty,
                ShippingFee = order.ShippingFee,
                FinalAmount = order.FinalAmount,
                Items = orderDetails.Select(x => new OrderItemDto
                {
                    ProductId = x.ProductId,
                    ProductName = x.ProductName,
                    Quantity = x.Quantity,
                    UnitPrice = x.UnitPrice,
                    Subtotal = x.Subtotal
                }).ToList()
            };
        }

        // Bán hàng tại quầy (POS): không cần cart, không phí ship, khách vãng
        // lai không bắt buộc có tài khoản, thanh toán và trừ kho ngay lập tức.
        // Không đụng tới CheckoutAsync() ở trên — dành riêng cho luồng online.
        public async Task<OrderDto> CheckoutPosAsync(PosCheckoutRequest request)
        {
            if (request.Items == null || !request.Items.Any())
                throw new Exception("No items to checkout.");

            decimal totalAmount = 0;
            var orderDetails = new List<OrderDetail>();

            foreach (var item in request.Items)
            {
                var product = await _catalogClient.GetProductAsync(item.ProductId);

                if (product == null)
                    throw new Exception($"Product {item.ProductId} not found.");

                if (product.StockQuantity < item.Quantity)
                    throw new Exception($"Product {item.ProductId} is out of stock.");

                var subtotal = product.Price * item.Quantity;
                totalAmount += subtotal;

                orderDetails.Add(new OrderDetail
                {
                    ProductId = item.ProductId,
                    ProductName = product.ProductName,
                    Quantity = item.Quantity,
                    UnitPrice = product.Price,
                    Subtotal = subtotal,
                    CreatedAt = DateTime.Now
                });
            }

            var order = new Order
            {
                OrderNumber = $"POS-{DateTime.Now:yyyyMMddHHmmssfff}",
                CustomerUserId = null,
                StaffUserId = request.StaffUserId,
                ReceiverName = string.IsNullOrWhiteSpace(request.ReceiverName) ? "Walk-in Customer" : request.ReceiverName,
                ReceiverPhone = string.Empty,
                OrderType = "POS",
                PaymentMethod = request.PaymentMethod,
                PaymentStatus = "Paid",
                OrderStatus = "Completed",
                TotalAmount = totalAmount,
                Discount = 0,
                Vat = 0,
                ShippingFee = 0,
                FinalAmount = totalAmount,
                CreatedAt = DateTime.Now,
                OrderDate = DateTime.Now
            };

            await _orderRepository.AddOrderAsync(order);
            await _orderRepository.SaveChangesAsync();

            foreach (var detail in orderDetails)
                detail.OrderId = order.OrderId;

            await _orderRepository.AddOrderDetailRangeAsync(orderDetails);
            await _orderRepository.SaveChangesAsync();

            // Trừ tồn kho ngay — POS thanh toán tức thì tại quầy, không đợi
            // bước duyệt trạng thái riêng như đơn online (chỉ trừ khi
            // OrderStatus đổi sang "Confirmed").
            foreach (var item in request.Items)
            {
                await _catalogClient.UpdateStockAsync(item.ProductId, item.Quantity);
            }

            order.OrderDetails = orderDetails;
            return MapToDto(order);
        }

        public async Task<List<OrderDto>> GetOrdersByUserIdAsync(int userId)
        {
            var orders = await _orderRepository.GetOrdersByUserIdAsync(userId);

            return orders.Select(MapToDto).ToList();
        }

        public async Task<List<OrderDto>> GetAllOrdersAsync()
        {
            var orders = await _orderRepository.GetAllOrdersAsync();

            return orders.Select(MapToDto).ToList();
        }


        public async Task<OrderDto> GetOrderByIdAsync(int orderId)
        {
            var order = await _orderRepository.GetOrderByIdAsync(orderId);

            if (order == null)
                throw new Exception("Order not found.");

            return MapToDto(order);
        }

        private static OrderDto MapToDto(Order order)
        {
            return new OrderDto
            {
                OrderId = order.OrderId,
                OrderNumber = order.OrderNumber,
                UserId = order.CustomerUserId ?? 0,
                OrderDate = order.OrderDate,
                TotalAmount = order.TotalAmount,
                OrderType = order.OrderType,
                ReceiverName = order.ReceiverName,
                ReceiverPhone = order.ReceiverPhone,
                PaymentMethod = order.PaymentMethod,
                PaymentStatus = order.PaymentStatus,
                OrderStatus = order.OrderStatus,
                ShippingAddress = order.ShippingAddress ?? string.Empty,
                ShippingFee = order.ShippingFee,
                FinalAmount = order.FinalAmount,
                Items = order.OrderDetails.Select(item => new OrderItemDto
                {
                    ProductId = item.ProductId,
                    ProductName = item.ProductName,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    Subtotal = item.Subtotal
                }).ToList()
            };
        }

        public async Task CancelOrderAsync(int orderId)
        {
            var order = await _orderRepository.GetOrderByIdAsync(orderId);

            if (order == null)
                throw new Exception("Order not found.");

            if (order.OrderStatus != "Pending")
                throw new Exception("Only pending orders can be cancelled.");

            order.OrderStatus = "Cancelled";
            order.UpdatedAt = DateTime.Now;

            await _orderRepository.SaveChangesAsync();
        }


        public async Task UpdateStatusAsync(int orderId, UpdateOrderStatusRequest request)
        {
            var order = await _orderRepository.GetOrderByIdAsync(orderId);

            if (order == null)
                throw new Exception("Order not found.");

            order.OrderStatus = request.Status;
            order.UpdatedAt = DateTime.Now;

            if (request.Status == "Confirmed")
            {
                foreach (var item in order.OrderDetails)
                {
                    await _catalogClient.UpdateStockAsync(
                        item.ProductId,
                        item.Quantity);
                }
            }

            await _orderRepository.SaveChangesAsync();
        }

        public async Task<int?> GetPurchasedOrderIdAsync(
    int userId,
    int productId)
        {
            var order = await _orderRepository
                .GetPurchasedOrderIdAsync(userId, productId);

            return order;
        }


    }
}
