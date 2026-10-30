using PaymentService.API.DTOs;
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

       

        Task<bool> DeleteAsync(int paymentId);

        Task<VnPayIpnResponse> ProcessVnPayIpnAsync(IQueryCollection query);

        Task<Payment?> GetByTxnRefAsync(string txnRef);
    }


}
