using PaymentService.API.Models;

namespace PaymentService.API.Interfaces
{
    public interface IPaymentService
    {
        Task<IEnumerable<Payment>> GetAllAsync();

        Task<Payment?> GetByIdAsync(int paymentId);

        Task<IEnumerable<Payment>> GetByOrderIdAsync(int orderId);

        Task<Payment> CreateAsync(
     int orderId,
     string paymentMethod);

        Task<bool> UpdateStatusAsync(
            int paymentId,
            string status,
            string? transactionCode = null);

        Task<bool> DeleteAsync(int paymentId);
    }
}
