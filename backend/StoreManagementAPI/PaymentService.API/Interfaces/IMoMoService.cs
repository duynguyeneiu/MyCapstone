using PaymentService.API.DTOs;
using PaymentService.API.Models;

namespace PaymentService.API.Interfaces
{
    public interface IMoMoService
    {
        Task<string> CreatePaymentUrlAsync(Payment payment);

        bool ValidateSignature(MoMoIpnRequest ipn);
    }
}