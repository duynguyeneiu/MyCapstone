using OrderServiceAPI.Models;

namespace OrderServiceAPI.Interfaces
{
    public interface IInvoiceRepository
    {
        Task AddInvoiceAsync(Invoice invoice);

        Task AddInvoiceDetailRangeAsync(List<InvoiceDetail> details);

        Task SaveChangesAsync();
    }
}
