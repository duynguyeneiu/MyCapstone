using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OrderServiceAPI.DTOs.Promotion;
using OrderServiceAPI.Interfaces;

namespace OrderServiceAPI.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class PromotionController : BaseApiController
    {
        private readonly IPromotionService _promotionService;

        public PromotionController(IPromotionService promotionService)
        {
            _promotionService = promotionService;
        }

        [Authorize(Roles = "Admin,Staff")]
        [HttpGet]
        public async Task<IActionResult> GetAll() =>
            Ok(await _promotionService.GetAllAsync());

        [Authorize(Roles = "Admin,Staff")]
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id) =>
            Ok(await _promotionService.GetByIdAsync(id));

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create(SavePromotionRequest request)
        {
            var created = await _promotionService.CreateAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = created.PromotionId }, created);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, SavePromotionRequest request)
        {
            await _promotionService.UpdateAsync(id, request);
            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _promotionService.DeleteAsync(id);
            return NoContent();
        }

        // Any logged-in user: preview the discount before placing the order.
        // Checkout recalculates it on the server, so this result is display-only.
        [HttpPost("validate")]
        public async Task<IActionResult> Validate(ValidatePromotionRequest request) =>
            Ok(await _promotionService.ValidateAsync(request.Code, request.OrderAmount));
    }
}
