using PaymentService.API.DTOs;
using PaymentService.API.Interfaces;
using PaymentService.API.Models;

namespace PaymentService.API.Services
{
    public class PaymentsService : IPaymentService
    {
        private readonly IPaymentRepository _paymentRepository;
        private readonly IOrderServiceClient _orderServiceClient;
        private readonly IVnPayService _vnPayService;
        private readonly ILogger<PaymentsService> _logger;

        public PaymentsService(
            IPaymentRepository paymentRepository,
            IOrderServiceClient orderServiceClient,
            IVnPayService vnPayService,
            ILogger<PaymentsService> logger)
        {
            _paymentRepository = paymentRepository;
            _orderServiceClient = orderServiceClient;
            _vnPayService = vnPayService;
            _logger = logger;
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

        private static readonly string[] AllowedMethods =
     { "COD", "Cash", "VNPay", "MoMo", "BankTransfer" };

        public async Task<Payment> CreateAsync(
            int orderId,
            string paymentMethod)
        {
            if (orderId <= 0)
            {
                throw new ArgumentException(
                    "OrderId must be greater than 0.");
            }

            if (!AllowedMethods.Contains(paymentMethod))
            {
                throw new ArgumentException(
                    $"Payment method must be one of: {string.Join(", ", AllowedMethods)}.");
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

            // Chặn thanh toán lại đơn đã trả tiền
            var existingPayments =
                await _paymentRepository.GetByOrderIdAsync(orderId);

            if (existingPayments.Any(p => p.Status == "Completed"))
            {
                throw new InvalidOperationException(
                    "Order has already been paid.");
            }

            var now = DateTime.Now;
            var isCash = paymentMethod == "Cash";
            var isOnline = paymentMethod is "VNPay" or "MoMo";

            var payment = new Payment
            {
                OrderId = order.OrderId,
                Amount = order.FinalAmount,   // Lấy từ OrderService, KHÔNG từ client
                PaymentMethod = paymentMethod,
                TxnRef = GenerateTxnRef(paymentMethod),
                Status = isCash ? "Completed" : "Pending",
                PaymentDate = isCash ? now : null,
                ExpiredAt = isOnline ? now.AddMinutes(15) : null,
                TransactionCode = null,
                CreatedAt = now,
                UpdatedAt = null
            };

            await _paymentRepository.AddAsync(payment);

            await _paymentRepository.SaveChangesAsync();

            return payment;
        }

        // VD: VNP20261030105412123456 — chỉ chữ + số
        private static string GenerateTxnRef(string method)
        {
            var prefix = method switch
            {
                "VNPay" => "VNP",
                "MoMo" => "MOMO",
                "Cash" => "CASH",
                "COD" => "COD",
                _ => "BT"
            };

            return $"{prefix}{DateTime.Now:yyyyMMddHHmmssfff}{Random.Shared.Next(100, 1000)}";
        }

        public async Task<VnPayIpnResponse> ProcessVnPayIpnAsync(
    IQueryCollection query)
        {
            // 1. Chữ ký
            if (!_vnPayService.ValidateSignature(query))
                return VnPayIpnResponse.Of("97", "Invalid signature");

            // 2. Tồn tại
            var txnRef = query["vnp_TxnRef"].ToString();
            var payment = await _paymentRepository.GetByTxnRefAsync(txnRef);

            if (payment == null)
                return VnPayIpnResponse.Of("01", "Order not found");

            // 3. Số tiền (VNPay gửi amount * 100)
            if (!long.TryParse(query["vnp_Amount"].ToString(), out var vnpAmount)
                || vnpAmount != (long)(payment.Amount * 100))
                return VnPayIpnResponse.Of("04", "Invalid amount");

            // 4. Đã xử lý chưa
            if (payment.Status != "Pending")
                return VnPayIpnResponse.Of("02", "Order already confirmed");

            // 5. Cập nhật có điều kiện
            var responseCode = query["vnp_ResponseCode"].ToString();
            var isSuccess = responseCode == "00"
                && query["vnp_TransactionStatus"].ToString() == "00";

            var affected = await _paymentRepository.UpdatePendingStatusAsync(
                txnRef,
                isSuccess ? "Completed" : "Failed",
                isSuccess ? query["vnp_TransactionNo"].ToString() : null,
                responseCode,
                query["vnp_BankCode"].ToString());

            if (affected == 0)
                return VnPayIpnResponse.Of("02", "Order already confirmed");

            // 6. Báo OrderService
            if (isSuccess)
            {
                try
                {
                    await _orderServiceClient.UpdatePaymentStatusAsync(
                        payment.OrderId, "Paid");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex,
                        "Payment {TxnRef} completed but failed to update order {OrderId}",
                        txnRef, payment.OrderId);
                }
            }

            return VnPayIpnResponse.Of("00", "Confirm Success");
        }
        public async Task<Payment?> GetByTxnRefAsync(string txnRef)
        {
            return await _paymentRepository.GetByTxnRefAsync(txnRef);
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
