using System;
using System.Collections.Generic;

namespace UserService.API.Models;

public partial class User
{
    public int UserId { get; set; }

    public string? FullName { get; set; } 

    public string? Gender { get; set; }

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public string? Address { get; set; }

    public string? Username { get; set; }

    public string Password { get; set; } = null!;

    public int RoleId { get; set; }

    public int? LoyaltyPoint { get; set; }

    public DateOnly? RegisterDate { get; set; }

    public string Status { get; set; } = null!;

    public string? ResetToken { get; set; }

    public DateTime? ResetTokenExpiry { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Role Role { get; set; } = null!;
}
