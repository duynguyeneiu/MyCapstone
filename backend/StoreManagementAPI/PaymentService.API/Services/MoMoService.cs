using Microsoft.Extensions.Options;
using PaymentService.API.DTOs;
using PaymentService.API.Helpers;
using PaymentService.API.Interfaces;
using PaymentService.API.Models;

namespace PaymentService.API.Services
{
    public class MoMoService : IMoMoService
    {
        private readonly HttpClient _httpClient;
        private readonly MoMoOptions _options;

        public MoMoService(HttpClient httpClient, IOptions<MoMoOptions> options)
        {
            _httpClient = httpClient;
            _options = options.Value;
        }

        public async Task<string> CreatePaymentUrlAsync(Payment payment)
        {
            var requestId = Guid.NewGuid().ToString("N");
            var amount = (long)payment.Amount;
            var orderInfo = $"Thanh toan don hang {payment.OrderId}";
            var extraData = "";

            // Thứ tự field CỐ ĐỊNH theo tài liệu MoMo, KHÔNG encode
            var rawSignature =
                $"accessKey={_options.AccessKey}" +
                $"&amount={amount}" +
                $"&extraData={extraData}" +
                $"&ipnUrl={_options.IpnUrl}" +
                $"&orderId={payment.TxnRef}" +
                $"&orderInfo={orderInfo}" +
                $"&partnerCode={_options.PartnerCode}" +
                $"&redirectUrl={_options.RedirectUrl}" +
                $"&requestId={requestId}" +
                $"&requestType={_options.RequestType}";

            var body = new
            {
                partnerCode = _options.PartnerCode,
                requestId,
                amount,
                orderId = payment.TxnRef,
                orderInfo,
                redirectUrl = _options.RedirectUrl,
                ipnUrl = _options.IpnUrl,
                requestType = _options.RequestType,
                extraData,
                lang = "vi",
                signature = MoMoHelper.HmacSha256(_options.SecretKey, rawSignature)
            };

            var response = await _httpClient.PostAsJsonAsync(_options.Endpoint, body);
            var result = await response.Content.ReadFromJsonAsync<MoMoCreateResponse>();

            if (result == null || result.ResultCode != 0 || string.IsNullOrEmpty(result.PayUrl))
            {
                throw new InvalidOperationException(
    $"MoMo error {result?.ResultCode}: {result?.Message ?? response.StatusCode.ToString()}");
            }

            return result.PayUrl;
        }

        public bool ValidateSignature(MoMoIpnRequest r)
        {
            var rawSignature =
                $"accessKey={_options.AccessKey}" +
                $"&amount={r.Amount}" +
                $"&extraData={r.ExtraData}" +
                $"&message={r.Message}" +
                $"&orderId={r.OrderId}" +
                $"&orderInfo={r.OrderInfo}" +
                $"&orderType={r.OrderType}" +
                $"&partnerCode={r.PartnerCode}" +
                $"&payType={r.PayType}" +
                $"&requestId={r.RequestId}" +
                $"&responseTime={r.ResponseTime}" +
                $"&resultCode={r.ResultCode}" +
                $"&transId={r.TransId}";

            var computed = MoMoHelper.HmacSha256(_options.SecretKey, rawSignature);

            return string.Equals(computed, r.Signature, StringComparison.OrdinalIgnoreCase);
        }
    }
}