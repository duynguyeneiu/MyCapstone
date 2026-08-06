using Microsoft.AspNetCore.Mvc;
using OrderServiceAPI.DTOs.Cart;
using OrderServiceAPI.Interfaces;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace OrderServiceAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }

        [HttpGet("{userId:int}")]
        public async Task<IActionResult> GetCart(int userId)
        {
            var cart = await _cartService.GetCartAsync(userId);

            return Ok(cart);
        }
        [HttpPost("items")]
        public async Task<IActionResult> AddItem(AddCartItemRequest request)
        {
            var result = await _cartService.AddItemAsync(request);

            return Ok(result);
        }



        [HttpPut("items/{cartDetailId:int}")]
        public async Task<IActionResult> UpdateItem(
        int cartDetailId,
        UpdateCartItemRequest request)
        {
            var result = await _cartService.UpdateItemAsync(cartDetailId, request);

            return Ok(result);
        }


        [HttpDelete("items/{cartDetailId:int}")]
        public async Task<IActionResult> RemoveItem(int cartDetailId)
        {
            var result = await _cartService.RemoveItemAsync(cartDetailId);

            return Ok(result);
        }



        [HttpDelete("{userId:int}")]
        public async Task<IActionResult> ClearCart(int userId)
        {
            await _cartService.ClearCartAsync(userId);

            return NoContent();
        }
    }
}
