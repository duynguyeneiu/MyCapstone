using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OrderServiceAPI.DTOs;
using OrderServiceAPI.DTOs.Order;
using OrderServiceAPI.Interfaces;

namespace OrderServiceAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {

        private readonly IOrderService _orderService;

        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout(CheckoutRequest request)
        {
            var result = await _orderService.CheckoutAsync(request);

            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllOrders()
        {
            var result = await _orderService.GetAllOrdersAsync();

            return Ok(result);
        }

        [HttpGet("user/{userId:int}")]
        public async Task<IActionResult> GetOrdersByUserId(int userId)
        {
            var result = await _orderService.GetOrdersByUserIdAsync(userId);

            return Ok(result);
        }

        [HttpGet("{orderId:int}")]
        public async Task<IActionResult> GetOrderById(int orderId)
        {
            var result = await _orderService.GetOrderByIdAsync(orderId);

            return Ok(result);
        }

        [HttpPut("{orderId:int}/cancel")]
        public async Task<IActionResult> CancelOrder(int orderId)
        {
            await _orderService.CancelOrderAsync(orderId);

            return NoContent();
        }


        [HttpPut("{orderId:int}/status")]
        public async Task<IActionResult> UpdateStatus(
        int orderId,
        UpdateOrderStatusRequest request)
            {
            await _orderService.UpdateStatusAsync(orderId, request);

            return NoContent();
        }

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
    }
}
