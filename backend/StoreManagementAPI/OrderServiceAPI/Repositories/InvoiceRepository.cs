using OrderServiceAPI.Data;
using OrderServiceAPI.Interfaces;
using OrderServiceAPI.Models;

namespace OrderServiceAPI.Repositories
{
    public class InvoiceRepository : IInvoiceRepository
    {
        private readonly OrderDbContext _context;

        public InvoiceRepository(OrderDbContext context)
        {
            _context = context;
        }

        public async Task AddInvoiceAsync(Invoice invoice)
        {
            await _context.Invoices.AddAsync(invoice);
        }

        public async Task AddInvoiceDetailRangeAsync(List<InvoiceDetail> details)
        {
            await _context.InvoiceDetails.AddRangeAsync(details);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
