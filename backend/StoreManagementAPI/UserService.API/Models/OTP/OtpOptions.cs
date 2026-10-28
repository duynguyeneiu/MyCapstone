namespace UserService.API.Models.Otp
{
    public class OtpOptions
    {
        public int Length { get; set; } = 6;
        public int ExpiryMinutes { get; set; } = 5;
        public int MaxAttempts { get; set; } = 5;
        public int ResendCooldownSeconds { get; set; } = 60;
        public int VerificationTokenMinutes { get; set; } = 10;
        public string MessageTemplate { get; set; } =
    "HappyMartket: Ma xac thuc cua ban la {0}. Hieu luc {1} phut.";
    }
}