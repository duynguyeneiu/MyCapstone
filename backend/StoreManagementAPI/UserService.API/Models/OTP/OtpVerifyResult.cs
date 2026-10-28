namespace UserService.API.Models.Otp
{
    public class OtpVerifyResult
    {
        public bool Success { get; init; }
        public string Message { get; init; } = "";
        public string? VerificationToken { get; init; }

        public static OtpVerifyResult Ok(string token) =>
            new() { Success = true, Message = "Xác thực thành công.", VerificationToken = token };

        public static OtpVerifyResult Fail(string message) =>
            new() { Success = false, Message = message };
    }
}