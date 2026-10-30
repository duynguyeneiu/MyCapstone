using PaymentService.API.Models;

namespace PaymentService.API.Interfaces
{
    public interface IVnPayService
    {
        string CreatePaymentUrl(Payment payment, string clientIp);

        bool ValidateSignature(IQueryCollection query);
    }
}