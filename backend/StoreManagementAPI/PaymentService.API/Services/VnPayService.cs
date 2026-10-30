using Microsoft.Extensions.Options;
using PaymentService.API.Helpers;
using PaymentService.API.Interfaces;
using PaymentService.API.Models;

namespace PaymentService.API.Services
{
    public class VnPayService : IVnPayService
    {
        private readonly VnPayOptions _options;

        public VnPayService(IOptions<VnPayOptions> options)
        {
            _options = options.Value;
        }

        public string CreatePaymentUrl(Payment payment, string clientIp)
        {
            var now = GetVietnamNow();

            var data = new Dictionary<string, string>
            {
                ["vnp_Version"] = _options.Version,
                ["vnp_Command"] = "pay",
                ["vnp_TmnCode"] = _options.TmnCode,
                ["vnp_Amount"] = ((long)(payment.Amount * 100)).ToString(),
                ["vnp_CurrCode"] = "VND",
                ["vnp_TxnRef"] = payment.TxnRef,
                ["vnp_OrderInfo"] = $"Thanh toan don hang {payment.OrderId}",
                ["vnp_OrderType"] = "other",
                ["vnp_Locale"] = "vn",
                ["vnp_ReturnUrl"] = _options.ReturnUrl,
                ["vnp_IpAddr"] = clientIp,
                ["vnp_CreateDate"] = now.ToString("yyyyMMddHHmmss"),
                ["vnp_ExpireDate"] = now.AddMinutes(15).ToString("yyyyMMddHHmmss")
            };

            var query = VnPayHelper.BuildQuery(data);
            var hash = VnPayHelper.HmacSha512(_options.HashSecret, query);

            return $"{_options.BaseUrl}?{query}&vnp_SecureHash={hash}";
        }

        public bool ValidateSignature(IQueryCollection query)
        {
            var receivedHash = query["vnp_SecureHash"].ToString();

            if (string.IsNullOrEmpty(receivedHash))
            {
                return false;
            }

            var data = query
                .Where(q => q.Key.StartsWith("vnp_")
                         && q.Key != "vnp_SecureHash"
                         && q.Key != "vnp_SecureHashType")
                .ToDictionary(q => q.Key, q => q.Value.ToString());

            var computedHash = VnPayHelper.HmacSha512(
                _options.HashSecret,
                VnPayHelper.BuildQuery(data));

            return string.Equals(
                computedHash, receivedHash, StringComparison.OrdinalIgnoreCase);
        }

        private static DateTime GetVietnamNow()
        {
            var tzId = OperatingSystem.IsWindows()
                ? "SE Asia Standard Time"
                : "Asia/Ho_Chi_Minh";

            return TimeZoneInfo.ConvertTimeFromUtc(
                DateTime.UtcNow,
                TimeZoneInfo.FindSystemTimeZoneById(tzId));
        }
    }
}