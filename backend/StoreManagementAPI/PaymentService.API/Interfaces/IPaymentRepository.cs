using PaymentService.API.Models;

namespace PaymentService.API.Interfaces
{
    public interface IPaymentRepository
    {
        Task<IEnumerable<Payment>> GetAllAsync();

        Task<Payment?> GetByIdAsync(int paymentId);

        Task<IEnumerable<Payment>> GetByOrderIdAsync(int orderId);

        Task AddAsync(Payment payment);

        void Update(Payment payment);

        void Delete(Payment payment);

        Task SaveChangesAsync();

        Task<Payment?> GetByTxnRefAsync(string txnRef);

        Task<int> UpdatePendingStatusAsync(
            string txnRef,
            string status,
            string? transactionCode,
            string? responseCode,
            string? bankCode);
    }
}
