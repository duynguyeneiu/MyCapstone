using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OrderServiceAPI.Interfaces;

namespace OrderServiceAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InvoiceController : ControllerBase
    {

        private readonly IInvoiceService _invoiceService;

        public InvoiceController(IInvoiceService invoiceService)
        {
            _invoiceService = invoiceService;
        }

        [HttpPost("from-order/{orderId:int}")]
        public async Task<IActionResult> CreateInvoice(
            int orderId,
            int staffUserId)
        {
            var result =
                await _invoiceService.CreateFromOrderAsync(orderId, staffUserId);

            return Ok(result);
        }
    }
}
