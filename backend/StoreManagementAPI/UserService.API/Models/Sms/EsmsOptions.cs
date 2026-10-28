namespace UserService.API.Models.Sms
{
    public class EsmsOptions
    {
        public string Endpoint { get; set; } = null!;
        public string ApiKey { get; set; } = null!;
        public string SecretKey { get; set; } = null!;
        public string Brandname { get; set; } = null!;
        public bool Sandbox { get; set; } = true;
    }
}