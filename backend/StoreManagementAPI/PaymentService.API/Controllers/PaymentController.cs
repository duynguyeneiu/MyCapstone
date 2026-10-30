using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PaymentService.API.DTOs;
using PaymentService.API.Interfaces;
using System.Net;
using Microsoft.Extensions.Options;
using PaymentService.API.Models;

namespace PaymentService.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly IVnPayService _vnPayService;
        private readonly VnPayOptions _vnPayOptions;

        public PaymentController(
            IPaymentService paymentService,
            IVnPayService vnPayService,
            IOptions<VnPayOptions> vnPayOptions)
        {
            _paymentService = paymentService;
            _vnPayService = vnPayService;
            _vnPayOptions = vnPayOptions.Value;
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
            catch (InvalidOperationException ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }
        [HttpPost("vnpay/create")]
        public async Task<IActionResult> CreateVnPay(
    [FromBody] CreateVnPayRequest dto)
        {
            try
            {
                var payment =
                    await _paymentService.CreateAsync(dto.OrderId, "VNPay");

                var remoteIp = HttpContext.Connection.RemoteIpAddress;
                var clientIp = remoteIp == null || IPAddress.IsLoopback(remoteIp)
                    ? "127.0.0.1"
                    : remoteIp.MapToIPv4().ToString();

                var paymentUrl =
                    _vnPayService.CreatePaymentUrl(payment, clientIp);

                return Ok(new
                {
                    paymentId = payment.PaymentId,
                    txnRef = payment.TxnRef,
                    paymentUrl
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex) when (
                ex is ArgumentException or InvalidOperationException)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


        // VNPay gọi server-to-server
        [HttpGet("vnpay-ipn")]
        public async Task<IActionResult> VnPayIpn()
        {
            try
            {
                var result =
                    await _paymentService.ProcessVnPayIpnAsync(Request.Query);

                return Ok(result);
            }
            catch (Exception)
            {
                return Ok(VnPayIpnResponse.Of("99", "Unknown error"));
            }
        }

        // Trình duyệt user quay về — CHỈ redirect, KHÔNG cập nhật DB
        [HttpGet("vnpay-return")]
        public IActionResult VnPayReturn()
        {
            var isValid = _vnPayService.ValidateSignature(Request.Query);
            var txnRef = Request.Query["vnp_TxnRef"].ToString();
            var code = Request.Query["vnp_ResponseCode"].ToString();
            var success = isValid && code == "00";

            var url = $"{_vnPayOptions.FrontendResultUrl}" +
                      $"?txnRef={Uri.EscapeDataString(txnRef)}" +
                      $"&success={success.ToString().ToLower()}" +
                      $"&code={code}";

            return Redirect(url);
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

        [HttpGet("txn/{txnRef}")]
        public async Task<IActionResult> GetByTxnRef(string txnRef)
        {
            var payment = await _paymentService.GetByTxnRefAsync(txnRef);

            if (payment == null)
            {
                return NotFound(new { message = $"Payment {txnRef} not found." });
            }

            return Ok(payment);
        }
    }
}
