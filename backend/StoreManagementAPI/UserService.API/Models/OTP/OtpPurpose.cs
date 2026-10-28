using System.Text.Json.Serialization;

namespace UserService.API.Models.Otp
{
    [JsonConverter(typeof(JsonStringEnumConverter<OtpPurpose>))]
    public enum OtpPurpose
    {
        Register,
        ForgotPassword
    }
}