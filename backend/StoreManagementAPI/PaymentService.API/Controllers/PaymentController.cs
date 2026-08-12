using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PaymentService.API.DTOs;
using PaymentService.API.Interfaces;

namespace PaymentService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var payments = await _paymentService.GetAllAsync();

            return Ok(payments);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var payment =
                await _paymentService.GetByIdAsync(id);

            if (payment == null)
            {
                return NotFound(new
                {
                    message = $"Payment with ID {id} not found."
                });
            }

            return Ok(payment);
        }

        [HttpGet("order/{orderId:int}")]
        public async Task<IActionResult> GetByOrderId(int orderId)
        {
            var payments =
                await _paymentService.GetByOrderIdAsync(orderId);

            return Ok(payments);
        }

        [HttpPost]
        public async Task<IActionResult> Create(
     [FromBody] CreatePaymentDto dto)
        {
            try
            {
                var payment =
                    await _paymentService.CreateAsync(
                        dto.OrderId,
                        dto.PaymentMethod);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = payment.PaymentId },
                    payment);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new
                {
                    message = ex.Message
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpPut("{id:int}/status")]
        public async Task<IActionResult> UpdateStatus(
            int id,
            [FromBody] UpdatePaymentStatusDto dto)
        {
            try
            {
                var updated =
                    await _paymentService.UpdateStatusAsync(
                        id,
                        dto.Status,
                        dto.TransactionCode);

                if (!updated)
                {
                    return NotFound(new
                    {
                        message = $"Payment with ID {id} not found."
                    });
                }

                var payment =
                    await _paymentService.GetByIdAsync(id);

                return Ok(payment);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deleted =
                await _paymentService.DeleteAsync(id);

            if (!deleted)
            {
                return NotFound(new
                {
                    message = $"Payment with ID {id} not found."
                });
            }

            return NoContent();
        }
    }
}
