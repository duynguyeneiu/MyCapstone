using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OrderServiceAPI.DTOs;
using OrderServiceAPI.DTOs.Order;
using OrderServiceAPI.Filters;
using OrderServiceAPI.Interfaces;

namespace OrderServiceAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : BaseApiController
    {

        private readonly IOrderService _orderService;
        private readonly IConfiguration _config;

        public OrderController(IOrderService orderService, IConfiguration config)
        {
            _orderService = orderService;
            _config = config;
        }

        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout(CheckoutRequest request)
        {
            request.UserId = CurrentUserId;
            var result = await _orderService.CheckoutAsync(request);

            return Ok(result);
        }

        [Authorize(Roles = "Admin,Staff")]
        [HttpPost("pos-checkout")]
        public async Task<IActionResult> CheckoutPos(PosCheckoutRequest request)
        {
            request.StaffUserId = CurrentUserId;
            var result = await _orderService.CheckoutPosAsync(request);

            return Ok(result);
        }

        [Authorize(Roles = "Admin,Staff")]
        [HttpGet]
        public async Task<IActionResult> GetAllOrders()
        {
            var result = await _orderService.GetAllOrdersAsync();

            return Ok(result);
        }

        [HttpGet("user/{userId:int}")]
        public async Task<IActionResult> GetOrdersByUserId(int userId)
        {
            if (!CanAccess(userId)) return Forbid();
            var result = await _orderService.GetOrdersByUserIdAsync(userId);

            return Ok(result);
        }

        // Internal: PaymentService gọi để lấy thông tin đơn
        [AllowAnonymous]
        [HttpGet("{orderId:int}")]
        public async Task<IActionResult> GetOrderById(int orderId)
        {
            var order = await _orderService.GetOrderByIdAsync(orderId);

            var isInternal = Request.Headers[InternalApiKeyAttribute.HeaderName]
                             == _config["InternalApi:Key"];
            if (isInternal) return Ok(order);

            if (User.Identity?.IsAuthenticated != true) return Unauthorized();
            if (!CanAccess(order.UserId)) return Forbid();

            return Ok(order);
        }

        [HttpPut("{orderId:int}/cancel")]
        public async Task<IActionResult> CancelOrder(int orderId)
        {
            await _orderService.CancelOrderAsync(orderId, CurrentUserId, IsStaff);

            return NoContent();
        }


        [Authorize(Roles = "Admin,Staff")]
        [HttpPut("{orderId:int}/status")]
        public async Task<IActionResult> UpdateStatus(
        int orderId,
        UpdateOrderStatusRequest request)
            {
            await _orderService.UpdateStatusAsync(orderId, request);

            return NoContent();
        }

        // Internal: ReviewService gọi để kiểm tra đã mua
        [AllowAnonymous]
        [InternalApiKey]
        [HttpGet("user/{userId:int}/product/{productId:int}/purchased")]
        public async Task<IActionResult> GetPurchasedOrder(
    int userId,
    int productId)
        {
            var orderId =
                await _orderService
                    .GetPurchasedOrderIdAsync(
                        userId,
                        productId);

            if (orderId == null)
            {
                return NotFound(new
                {
                    message = "User has not purchased this product. --OrderCon"
                });
            }

            return Ok(new
            {
                orderId = orderId.Value
            });
        }

        // Internal: PaymentService gọi sau khi thanh toán
        [AllowAnonymous]
        [InternalApiKey]
        [HttpPut("{orderId:int}/payment-status")]
        public async Task<IActionResult> UpdatePaymentStatus(
    int orderId,
    UpdatePaymentStatusRequest request)
        {
            await _orderService.UpdatePaymentStatusAsync(
                orderId, request.PaymentStatus);

            return NoContent();
        }
    }
}
