using PaymentService.API.Interfaces;
using PaymentService.API.Models;

namespace PaymentService.API.Services
{
    public class PaymentsService : IPaymentService
    {
        private readonly IPaymentRepository _paymentRepository;
        private readonly IOrderServiceClient _orderServiceClient;

        public PaymentsService(
            IPaymentRepository paymentRepository,
            IOrderServiceClient orderServiceClient)
        {
            _paymentRepository = paymentRepository;
            _orderServiceClient = orderServiceClient;
        }

        public async Task<IEnumerable<Payment>> GetAllAsync()
        {
            return await _paymentRepository.GetAllAsync();
        }

        public async Task<Payment?> GetByIdAsync(int paymentId)
        {
            return await _paymentRepository.GetByIdAsync(paymentId);
        }

        public async Task<IEnumerable<Payment>> GetByOrderIdAsync(
            int orderId)
        {
            return await _paymentRepository
                .GetByOrderIdAsync(orderId);
        }

        public async Task<Payment> CreateAsync(
    int orderId,
    string paymentMethod)
        {
            if (orderId <= 0)
            {
                throw new ArgumentException(
                    "OrderId must be greater than 0.");
            }

            if (paymentMethod != "COD" &&
                paymentMethod != "VNPay")
            {
                throw new ArgumentException(
                    "Payment method must be COD or VNPay.");
            }

            var order =
                await _orderServiceClient.GetOrderAsync(orderId);

            if (order == null)
            {
                throw new KeyNotFoundException(
                    $"Order with ID {orderId} not found.");
            }

            if (order.FinalAmount <= 0)
            {
                throw new InvalidOperationException(
                    "Order final amount must be greater than 0.");
            }

            var payment = new Payment
            {
                OrderId = order.OrderId,
                Amount = order.FinalAmount,
                PaymentMethod = paymentMethod,
                Status = "Pending",
                PaymentDate = null,
                TransactionCode = null,
                CreatedAt = DateTime.Now,
                UpdatedAt = null
            };

            await _paymentRepository.AddAsync(payment);

            await _paymentRepository.SaveChangesAsync();

            return payment;
        }

public async Task<bool> UpdateStatusAsync(
    int paymentId,
    string status,
    string? transactionCode = null)
        {
            var payment =
                await _paymentRepository.GetByIdAsync(paymentId);

            if (payment == null)
            {
                return false;
            }

            // Validate status
            if (status != "Pending" &&
                status != "Completed" &&
                status != "Failed" &&
                status != "Cancelled")
            {
                throw new ArgumentException(
                    "Invalid payment status.");
            }

            // Completed, Failed and Cancelled
            // are final states.
            if (payment.Status == "Completed" ||
                payment.Status == "Failed" ||
                payment.Status == "Cancelled")
            {
                throw new InvalidOperationException(
                    $"Payment is already in final status '{payment.Status}' " +
                    "and cannot be changed.");
            }

            // Payment can only be updated from Pending
            if (payment.Status != "Pending")
            {
                throw new InvalidOperationException(
                    $"Payment with status '{payment.Status}' " +
                    "cannot be updated.");
            }

            payment.Status = status;
            payment.TransactionCode = transactionCode;
            payment.UpdatedAt = DateTime.Now;

            if (status == "Completed")
            {
                payment.PaymentDate = DateTime.Now;
            }

            _paymentRepository.Update(payment);

            await _paymentRepository.SaveChangesAsync();

            return true;
        }



        public async Task<bool> DeleteAsync(int paymentId)
        {
            var payment =
                await _paymentRepository.GetByIdAsync(paymentId);

            if (payment == null)
            {
                return false;
            }

            _paymentRepository.Delete(payment);

            await _paymentRepository.SaveChangesAsync();

            return true;
        }
    }
}
