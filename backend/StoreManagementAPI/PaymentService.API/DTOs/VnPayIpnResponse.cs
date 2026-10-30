using System.Text.Json.Serialization;

namespace PaymentService.API.DTOs
{
    public class VnPayIpnResponse
    {
        [JsonPropertyName("RspCode")]
        public string RspCode { get; set; } = string.Empty;

        [JsonPropertyName("Message")]
        public string Message { get; set; } = string.Empty;

        public static VnPayIpnResponse Of(string code, string message)
            => new() { RspCode = code, Message = message };
    }
}