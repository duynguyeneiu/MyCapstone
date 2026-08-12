using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ReviewService.API.DTOs;
using ReviewService.API.Interfaces;
using System.Security.Claims;

namespace ReviewService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        public ReviewsController(
            IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var reviews =
                await _reviewService.GetAllAsync();

            return Ok(reviews);
        }

        [HttpGet("product/{productId:int}")]
        public async Task<IActionResult> GetByProduct(
            int productId)
        {
            var reviews =
                await _reviewService
                    .GetByProductIdAsync(productId);

            return Ok(reviews);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(
            int id)
        {
            var review =
                await _reviewService.GetByIdAsync(id);

            if (review == null)
            {
                return NotFound(new
                {
                    message = $"Review with ID {id} not found."
                });
            }

            return Ok(review);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create(
    [FromBody] CreateReviewDto dto)
        {
            var userIdClaim =
                User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null ||
                !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized(new
                {
                    message = "Invalid user information."
                });
            }

            try
            {
                var review =
                    await _reviewService.CreateAsync(
                        dto,
                        userId);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = review.ReviewId },
                    review);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    message = ex.Message
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(
                    StatusCodes.Status403Forbidden,
                    new
                    {
                        message = ex.Message
                    });
            }
        }

        [Authorize]
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(
    int id,
    [FromBody] UpdateReviewDto dto)
        {
            var userIdClaim =
                User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null ||
                !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized(new
                {
                    message = "Invalid user information."
                });
            }

            try
            {
                var updated =
                    await _reviewService
                        .UpdateAsync(id, dto, userId);

                if (!updated)
                {
                    return NotFound(new
                    {
                        message =
                            $"Review with ID {id} not found."
                    });
                }

                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(
                    StatusCodes.Status403Forbidden,
                    new
                    {
                        message = ex.Message
                    });
            }
        }

        [Authorize]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userIdClaim =
                User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null ||
                !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized(new
                {
                    message = "Invalid user information."
                });
            }

            try
            {
                var deleted =
                    await _reviewService
                        .DeleteAsync(id, userId);

                if (!deleted)
                {
                    return NotFound(new
                    {
                        message =
                            $"Review with ID {id} not found."
                    });
                }

                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(
                    StatusCodes.Status403Forbidden,
                    new
                    {
                        message = ex.Message
                    });
            }
        }
    }
}
