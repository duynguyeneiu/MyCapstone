using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using UserService.API.Helpers;
using UserService.API.Models;
using UserService.API.Services;

namespace UserService.API.Tests;

public class PhoneHelperTests
{
    [Theory]
    [InlineData("0912345678", "0912345678")]
    [InlineData("+84912345678", "0912345678")]
    [InlineData("84912345678", "0912345678")]
    [InlineData("091 234 5678", "0912345678")]
    [InlineData("091-234-5678", "0912345678")]
    [InlineData("(091) 234.5678", "0912345678")]
    public void Normalize_ValidVietnamesePhone_ReturnsTenDigitsStartingWithZero(string input, string expected)
    {
        Assert.Equal(expected, PhoneHelper.Normalize(input));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("12345")]
    [InlineData("09123456789")]
    [InlineData("abcdefghij")]
    [InlineData("1912345678")]
    public void Normalize_InvalidPhone_ReturnsNull(string? input)
    {
        Assert.Null(PhoneHelper.Normalize(input));
    }
}

public class PasswordHelperTests
{
    [Fact]
    public void HashPassword_SamePasswordTwice_ProducesDifferentHashes()
    {
        var first = PasswordHelper.HashPassword("secret123");
        var second = PasswordHelper.HashPassword("secret123");

        Assert.NotEqual(first, second); // random salt per hash
        Assert.True(PasswordHelper.VerifyPassword("secret123", first));
        Assert.True(PasswordHelper.VerifyPassword("secret123", second));
        Assert.False(PasswordHelper.VerifyPassword("Secret123", first));
    }
}

public class JwtServiceTests
{
    private const string Key = "UnitTestSigningKey_AtLeast32Characters!!";

    private static JwtService CreateSut() => new(new ConfigurationBuilder()
        .AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Jwt:Key"] = Key,
            ["Jwt:Issuer"] = "UserService",
            ["Jwt:Audience"] = "RetailManagement",
            ["Jwt:ExpireMinutes"] = "60"
        })
        .Build());

    private static User Admin() => new()
    {
        UserId = 7,
        FullName = "Store Admin",
        Phone = "0900000000",
        Password = "hash",
        Status = "Active",
        Role = new Role { RoleId = 1, RoleName = "Admin" }
    };

    [Fact]
    public void GenerateToken_ContainsIssuerAudienceAndExpiry()
    {
        var token = new JwtSecurityTokenHandler().ReadJwtToken(CreateSut().GenerateToken(Admin()));

        Assert.Equal("UserService", token.Issuer);
        Assert.Contains("RetailManagement", token.Audiences);
        Assert.InRange(token.ValidTo, DateTime.UtcNow.AddMinutes(55), DateTime.UtcNow.AddMinutes(65));
    }

    [Fact]
    public void GenerateToken_ValidatesWithSharedKeyAndCarriesUserIdAndRole()
    {
        var token = CreateSut().GenerateToken(Admin());

        var principal = new JwtSecurityTokenHandler().ValidateToken(token, new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = "UserService",
            ValidateAudience = true,
            ValidAudience = "RetailManagement",
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Key))
        }, out _);

        Assert.Equal("7", principal.FindFirstValue(ClaimTypes.NameIdentifier));
        Assert.True(principal.IsInRole("Admin"));
    }

    [Fact]
    public void GenerateToken_SignedWithDifferentKey_FailsValidation()
    {
        var token = CreateSut().GenerateToken(Admin());

        Assert.ThrowsAny<SecurityTokenException>(() =>
            new JwtSecurityTokenHandler().ValidateToken(token, new TokenValidationParameters
            {
                ValidIssuer = "UserService",
                ValidAudience = "RetailManagement",
                IssuerSigningKey = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes("Another_Service_Key_That_Is_Long_Enough!!"))
            }, out _));
    }
}
