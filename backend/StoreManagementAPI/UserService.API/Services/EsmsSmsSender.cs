using System.Text.Json;
using Microsoft.Extensions.Options;
using UserService.API.Interfaces;
using UserService.API.Models.Sms;

namespace UserService.API.Services
{
    public class EsmsSmsSender : ISmsSender
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly EsmsOptions _options;
        private readonly ILogger<EsmsSmsSender> _logger;

        // eSMS dùng tên field PascalCase -> giữ nguyên tên property, không đổi sang camelCase
        private static readonly JsonSerializerOptions JsonOptions = new()
        {
            PropertyNamingPolicy = null
        };

        public EsmsSmsSender(
            IHttpClientFactory httpClientFactory,
            IOptions<EsmsOptions> options,
            ILogger<EsmsSmsSender> logger)
        {
            _httpClientFactory = httpClientFactory;
            _options = options.Value;
            _logger = logger;
        }

        public async Task SendAsync(string phone, string message)
        {
            var payload = new
            {
                ApiKey = _options.ApiKey,
                SecretKey = _options.SecretKey,
                Phone = phone,
                Content = message,
                Brandname = _options.Brandname,
                SmsType = "2",                      // tin CSKH / OTP
                IsUnicode = "0",                    // nội dung không dấu
                Sandbox = _options.Sandbox ? "1" : "0",
                RequestId = Guid.NewGuid().ToString("N")
            };

            var client = _httpClientFactory.CreateClient("esms");
            var response = await client.PostAsJsonAsync(_options.Endpoint, payload, JsonOptions);
            response.EnsureSuccessStatusCode();

            var result = await response.Content.ReadFromJsonAsync<EsmsResponse>();

            if (result?.CodeResult != "100")
            {
                throw new InvalidOperationException(
                    $"eSMS error {result?.CodeResult}: {result?.ErrorMessage}");
            }

            if (_options.Sandbox)
            {
                // Sandbox không gửi về máy -> log nội dung để còn test được luồng OTP
                _logger.LogInformation(
                    "[eSMS SANDBOX] To: {Phone} | SMSID: {SmsId} | Message: {Message}",
                    phone, result.SMSID, message);
            }
            else
            {
                _logger.LogInformation(
                    "[eSMS] Sent to {Phone} | SMSID: {SmsId}", phone, result.SMSID);
            }
        }

        private class EsmsResponse
        {
            public string? CodeResult { get; set; }
            public string? SMSID { get; set; }
            public string? ErrorMessage { get; set; }
        }
    }
}