namespace UserService.API.Models.Otp
{
    public class OtpEntry
    {
        public string CodeHash { get; set; } = null!;
        public int Attempts { get; set; }
    }
}