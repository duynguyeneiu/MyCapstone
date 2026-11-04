using Moq;
using UserService.API.DTOs;
using UserService.API.Helpers;
using UserService.API.Interfaces;
using UserService.API.Models;
using UserService.API.Models.Otp;
using UserService.API.Services;

namespace UserService.API.Tests;

public class AuthServiceTests
{
    private const string Phone = "0912345678";
    private const string Password = "secret123";

    private readonly Mock<IUserRepository> _repo = new();
    private readonly Mock<IJwtService> _jwt = new();
    private readonly Mock<IOtpService> _otp = new();
    private readonly AuthService _sut;

    public AuthServiceTests()
    {
        _sut = new AuthService(_repo.Object, _jwt.Object, _otp.Object);
    }

    private static User ExistingUser(string role = "Customer") => new()
    {
        UserId = 1,
        FullName = "Nguyen Duy",
        Phone = Phone,
        Password = PasswordHelper.HashPassword(Password),
        Status = "Active",
        RoleId = 3,
        Role = new Role { RoleId = 3, RoleName = role }
    };

    private static RegisterRequestDto NewRegister(string phone = Phone) => new()
    {
        FullName = "Nguyen Duy",
        Phone = phone,
        Password = Password,
        VerificationToken = "otp-token"
    };

    // ---------- Login ----------

    [Fact]
    public async Task LoginAsync_UnknownPhone_ReturnsNull()
    {
        _repo.Setup(r => r.GetByPhoneAsync(Phone)).ReturnsAsync((User?)null);

        var result = await _sut.LoginAsync(new LoginRequest { Phone = Phone, Password = Password });

        Assert.Null(result);
    }

    [Fact]
    public async Task LoginAsync_WrongPassword_ReturnsNullAndIssuesNoToken()
    {
        _repo.Setup(r => r.GetByPhoneAsync(Phone)).ReturnsAsync(ExistingUser());

        var result = await _sut.LoginAsync(new LoginRequest { Phone = Phone, Password = "wrong-password" });

        Assert.Null(result);
        _jwt.Verify(j => j.GenerateToken(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task LoginAsync_InternationalPhoneFormat_IsNormalizedAndLogsIn()
    {
        var user = ExistingUser(role: "Admin");
        _repo.Setup(r => r.GetByPhoneAsync(Phone)).ReturnsAsync(user);
        _jwt.Setup(j => j.GenerateToken(user)).Returns("jwt-token");

        var result = await _sut.LoginAsync(new LoginRequest { Phone = "+84 912 345 678", Password = Password });

        Assert.NotNull(result);
        Assert.Equal("jwt-token", result!.Token);
        Assert.Equal("Admin", result.Role);
        Assert.Equal(1, result.UserId);
    }

    // ---------- Register ----------

    [Fact]
    public async Task RegisterAsync_InvalidPhone_ReturnsInvalidPhone()
    {
        var result = await _sut.RegisterAsync(NewRegister(phone: "12345"));

        Assert.Equal(RegisterError.InvalidPhone, result.Error);
    }

    [Fact]
    public async Task RegisterAsync_PhoneAlreadyRegistered_ReturnsPhoneExists()
    {
        _repo.Setup(r => r.PhoneExistsAsync(Phone)).ReturnsAsync(true);

        var result = await _sut.RegisterAsync(NewRegister());

        Assert.Equal(RegisterError.PhoneExists, result.Error);
        _repo.Verify(r => r.AddAsync(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task RegisterAsync_OtpNotVerified_ReturnsInvalidVerificationAndCreatesNoUser()
    {
        _repo.Setup(r => r.PhoneExistsAsync(Phone)).ReturnsAsync(false);
        _repo.Setup(r => r.GetRoleByNameAsync("Customer")).ReturnsAsync(new Role { RoleId = 3, RoleName = "Customer" });
        _otp.Setup(o => o.ConsumeVerificationToken(Phone, OtpPurpose.Register, "otp-token")).Returns(false);

        var result = await _sut.RegisterAsync(NewRegister());

        Assert.Equal(RegisterError.InvalidVerification, result.Error);
        _repo.Verify(r => r.AddAsync(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task RegisterAsync_ValidRequest_CreatesCustomerWithHashedPassword()
    {
        User? saved = null;
        _repo.Setup(r => r.PhoneExistsAsync(Phone)).ReturnsAsync(false);
        _repo.Setup(r => r.GetRoleByNameAsync("Customer")).ReturnsAsync(new Role { RoleId = 3, RoleName = "Customer" });
        _otp.Setup(o => o.ConsumeVerificationToken(Phone, OtpPurpose.Register, "otp-token")).Returns(true);
        _repo.Setup(r => r.AddAsync(It.IsAny<User>()))
            .Callback<User>(u => saved = u)
            .Returns(Task.CompletedTask);

        var result = await _sut.RegisterAsync(NewRegister());

        Assert.Equal(RegisterError.None, result.Error);
        Assert.Equal("Customer", result.Data!.Role);
        Assert.NotNull(saved);
        Assert.Equal(3, saved!.RoleId);
        Assert.NotEqual(Password, saved.Password);                        // never stored in plain text
        Assert.True(PasswordHelper.VerifyPassword(Password, saved.Password)); // BCrypt hash matches
        _repo.Verify(r => r.SaveChangesAsync(), Times.Once);
    }

    // ---------- Change / reset password ----------

    [Fact]
    public async Task ChangePasswordAsync_WrongCurrentPassword_ReturnsFalse()
    {
        _repo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(ExistingUser());

        var ok = await _sut.ChangePasswordAsync(1, new ChangePasswordRequestDto
        {
            CurrentPassword = "wrong",
            NewPassword = "newpass123",
            ConfirmNewPassword = "newpass123"
        });

        Assert.False(ok);
        _repo.Verify(r => r.SaveChangesAsync(), Times.Never);
    }

    [Fact]
    public async Task ChangePasswordAsync_ConfirmationDoesNotMatch_ReturnsFalse()
    {
        _repo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(ExistingUser());

        var ok = await _sut.ChangePasswordAsync(1, new ChangePasswordRequestDto
        {
            CurrentPassword = Password,
            NewPassword = "newpass123",
            ConfirmNewPassword = "different"
        });

        Assert.False(ok);
    }

    [Fact]
    public async Task ChangePasswordAsync_ValidRequest_StoresNewHash()
    {
        var user = ExistingUser();
        _repo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(user);

        var ok = await _sut.ChangePasswordAsync(1, new ChangePasswordRequestDto
        {
            CurrentPassword = Password,
            NewPassword = "newpass123",
            ConfirmNewPassword = "newpass123"
        });

        Assert.True(ok);
        Assert.True(PasswordHelper.VerifyPassword("newpass123", user.Password));
        _repo.Verify(r => r.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task ResetPasswordAsync_PhoneNotRegistered_ReturnsUserNotFound()
    {
        _repo.Setup(r => r.GetByPhoneAsync(Phone)).ReturnsAsync((User?)null);

        var result = await _sut.ResetPasswordAsync(new ResetPasswordRequestDto
        {
            Phone = Phone,
            NewPassword = "newpass123",
            ConfirmNewPassword = "newpass123",
            VerificationToken = "otp-token"
        });

        Assert.Equal(ResetPasswordError.UserNotFound, result);
    }

    [Fact]
    public async Task ResetPasswordAsync_VerifiedOtp_UpdatesPassword()
    {
        var user = ExistingUser();
        _repo.Setup(r => r.GetByPhoneAsync(Phone)).ReturnsAsync(user);
        _otp.Setup(o => o.ConsumeVerificationToken(Phone, OtpPurpose.ForgotPassword, "otp-token")).Returns(true);

        var result = await _sut.ResetPasswordAsync(new ResetPasswordRequestDto
        {
            Phone = Phone,
            NewPassword = "newpass123",
            ConfirmNewPassword = "newpass123",
            VerificationToken = "otp-token"
        });

        Assert.Equal(ResetPasswordError.None, result);
        Assert.True(PasswordHelper.VerifyPassword("newpass123", user.Password));
    }
}
