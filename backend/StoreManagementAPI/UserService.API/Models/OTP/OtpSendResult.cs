namespace UserService.API.Models.Otp
{
    public class OtpSendResult
    {
        public bool Success { get; init; }
        public string Message { get; init; } = "";
        public int RetryAfterSeconds { get; init; }

        public static OtpSendResult Ok(int retryAfter) =>
            new() { Success = true, Message = "Đã gửi mã OTP.", RetryAfterSeconds = retryAfter };

        public static OtpSendResult Fail(string message, int retryAfter = 0) =>
            new() { Success = false, Message = message, RetryAfterSeconds = retryAfter };
    }
}