using UserService.API.Models.Otp;

namespace UserService.API.Interfaces
{
    public interface IOtpService
    {
        Task<OtpSendResult> SendAsync(string phone, OtpPurpose purpose);
        Task<OtpVerifyResult> VerifyAsync(string phone, OtpPurpose purpose, string code);

        bool ConsumeVerificationToken(string phone, OtpPurpose purpose, string token);
    }
}