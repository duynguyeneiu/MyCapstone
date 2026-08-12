namespace UserService.API.DTOs.User
{
    public class UserDto
    {
        public int UserId { get; set; }

        public string? FullName { get; set; } = null!;

        public string? Gender { get; set; }

        public string? Phone { get; set; }

        public string? Email { get; set; }

        public string? Address { get; set; }

        public string? Username { get; set; } = null!;

        public int RoleId { get; set; }

        public string? RoleName { get; set; }

        public int? LoyaltyPoint { get; set; }

        public DateOnly? RegisterDate { get; set; }

        public string Status { get; set; } = null!;

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}
