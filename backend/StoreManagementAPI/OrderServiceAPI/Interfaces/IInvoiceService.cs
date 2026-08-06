using OrderServiceAPI.DTOs.Invoice;

namespace OrderServiceAPI.Interfaces
{
    public interface IInvoiceService
    {
        Task<InvoiceDto> CreateFromOrderAsync(int orderId, int staffUserId);
    }
}
