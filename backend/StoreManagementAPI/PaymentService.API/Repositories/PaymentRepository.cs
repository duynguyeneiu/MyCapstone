using Microsoft.EntityFrameworkCore;
using PaymentService.API.Data;
using PaymentService.API.Interfaces;
using PaymentService.API.Models;

namespace PaymentService.API.Repositories
{
    public class PaymentRepository : IPaymentRepository
    {
        private readonly PaymentDbContext _context;

        public PaymentRepository(PaymentDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Payment>> GetAllAsync()
        {
            return await _context.Payments
                .AsNoTracking()
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<Payment?> GetByIdAsync(int paymentId)
        {
            return await _context.Payments
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    p => p.PaymentId == paymentId);
        }

        public async Task<IEnumerable<Payment>> GetByOrderIdAsync(
            int orderId)
        {
            return await _context.Payments
                .AsNoTracking()
                .Where(p => p.OrderId == orderId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task AddAsync(Payment payment)
        {
            await _context.Payments.AddAsync(payment);
        }

        public void Update(Payment payment)
        {
            _context.Payments.Update(payment);
        }

        public void Delete(Payment payment)
        {
            _context.Payments.Remove(payment);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public async Task<Payment?> GetByTxnRefAsync(string txnRef)
        {
            return await _context.Payments
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.TxnRef == txnRef);
        }

        // UPDATE ... WHERE TxnRef = @ref AND Status = 'Pending'
        // Trả về số dòng bị ảnh hưởng: 0 = đã xử lý trước đó
        public async Task<int> UpdatePendingStatusAsync(
            string txnRef,
            string status,
            string? transactionCode,
            string? responseCode,
            string? bankCode)
        {
            var now = DateTime.Now;
            DateTime? paymentDate = status == "Completed" ? now : null;

            return await _context.Payments
                .Where(p => p.TxnRef == txnRef && p.Status == "Pending")
                .ExecuteUpdateAsync(s => s
                    .SetProperty(p => p.Status, status)
                    .SetProperty(p => p.TransactionCode, transactionCode)
                    .SetProperty(p => p.ResponseCode, responseCode)
                    .SetProperty(p => p.BankCode, bankCode)
                    .SetProperty(p => p.PaymentDate, paymentDate)
                    .SetProperty(p => p.UpdatedAt, now));
        }
    }
}
