namespace UserService.API.DTOs
{
    public class RegisterResponseDto
    {
        public int UserId { get; set; }

        public string FullName { get; set; } = null!;

        public string Phone { get; set; } = null!;

        public string Role { get; set; } = null!;

        public string Status { get; set; } = null!;
    }
}
