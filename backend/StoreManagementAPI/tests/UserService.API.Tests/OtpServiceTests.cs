using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Moq;
using UserService.API.Interfaces;
using UserService.API.Models.Otp;
using UserService.API.Services;

namespace UserService.API.Tests;

// Uses a real in-memory cache; only the SMS sender is mocked so the test can
// read the OTP code that would have been sent to the phone.
public sealed class OtpServiceTests : IDisposable
{
    private const string Phone = "0912345678";

    private readonly MemoryCache _cache = new(new MemoryCacheOptions());
    private readonly Mock<ISmsSender> _sms = new();
    private string? _lastSms;

    private OtpService CreateSut(int maxAttempts = 5, int cooldownSeconds = 60)
    {
        _sms.Setup(s => s.SendAsync(It.IsAny<string>(), It.IsAny<string>()))
            .Callback<string, string>((_, message) => _lastSms = message)
            .Returns(Task.CompletedTask);

        var options = Options.Create(new OtpOptions
        {
            Length = 6,
            ExpiryMinutes = 5,
            MaxAttempts = maxAttempts,
            ResendCooldownSeconds = cooldownSeconds,
            VerificationTokenMinutes = 10,
            MessageTemplate = "{0}" // SMS body == the code, so the test can read it
        });

        return new OtpService(_cache, _sms.Object, options, NullLogger<OtpService>.Instance);
    }

    public void Dispose() => _cache.Dispose();

    [Fact]
    public async Task SendAsync_InvalidPhone_FailsWithoutSendingSms()
    {
        var sut = CreateSut();

        var result = await sut.SendAsync("123", OtpPurpose.Register);

        Assert.False(result.Success);
        _sms.Verify(s => s.SendAsync(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task SendAsync_ValidPhone_SendsSixDigitCode()
    {
        var sut = CreateSut();

        var result = await sut.SendAsync(Phone, OtpPurpose.Register);

        Assert.True(result.Success);
        Assert.NotNull(_lastSms);
        Assert.Matches(@"^\d{6}$", _lastSms!);
    }

    [Fact]
    public async Task SendAsync_ResendWithinCooldown_IsRejected()
    {
        var sut = CreateSut(cooldownSeconds: 60);

        await sut.SendAsync(Phone, OtpPurpose.Register);
        var second = await sut.SendAsync(Phone, OtpPurpose.Register);

        Assert.False(second.Success);
        Assert.True(second.RetryAfterSeconds > 0);
        _sms.Verify(s => s.SendAsync(It.IsAny<string>(), It.IsAny<string>()), Times.Once);
    }

    [Fact]
    public async Task SendAsync_SmsProviderFails_AllowsImmediateResend()
    {
        var sut = CreateSut();
        _sms.Setup(s => s.SendAsync(It.IsAny<string>(), It.IsAny<string>()))
            .ThrowsAsync(new HttpRequestException("SMS gateway down"));

        var failed = await sut.SendAsync(Phone, OtpPurpose.Register);

        _sms.Setup(s => s.SendAsync(It.IsAny<string>(), It.IsAny<string>()))
            .Returns(Task.CompletedTask);
        var retried = await sut.SendAsync(Phone, OtpPurpose.Register);

        Assert.False(failed.Success);
        Assert.True(retried.Success); // cooldown was cleared after the failure
    }

    [Fact]
    public async Task VerifyAsync_CorrectCode_ReturnsTokenThatCanBeUsedOnlyOnce()
    {
        var sut = CreateSut();
        await sut.SendAsync(Phone, OtpPurpose.Register);

        var verify = await sut.VerifyAsync(Phone, OtpPurpose.Register, _lastSms!);

        Assert.True(verify.Success);
        Assert.False(string.IsNullOrEmpty(verify.VerificationToken));
        Assert.True(sut.ConsumeVerificationToken(Phone, OtpPurpose.Register, verify.VerificationToken!));
        Assert.False(sut.ConsumeVerificationToken(Phone, OtpPurpose.Register, verify.VerificationToken!));
    }

    [Fact]
    public async Task VerifyAsync_SameCodeTwice_SecondAttemptFails()
    {
        var sut = CreateSut();
        await sut.SendAsync(Phone, OtpPurpose.Register);
        var code = _lastSms!;

        var first = await sut.VerifyAsync(Phone, OtpPurpose.Register, code);
        var second = await sut.VerifyAsync(Phone, OtpPurpose.Register, code);

        Assert.True(first.Success);
        Assert.False(second.Success);
    }

    [Fact]
    public async Task VerifyAsync_TooManyWrongAttempts_InvalidatesTheCode()
    {
        var sut = CreateSut(maxAttempts: 3);
        await sut.SendAsync(Phone, OtpPurpose.Register);
        var correct = _lastSms!;
        var wrong = correct == "000000" ? "111111" : "000000";

        for (var i = 0; i < 3; i++)
            Assert.False((await sut.VerifyAsync(Phone, OtpPurpose.Register, wrong)).Success);

        var afterLockout = await sut.VerifyAsync(Phone, OtpPurpose.Register, correct);

        Assert.False(afterLockout.Success);
    }

    [Fact]
    public async Task VerificationToken_ForRegister_CannotBeUsedToResetPassword()
    {
        var sut = CreateSut();
        await sut.SendAsync(Phone, OtpPurpose.Register);
        var verify = await sut.VerifyAsync(Phone, OtpPurpose.Register, _lastSms!);

        Assert.False(sut.ConsumeVerificationToken(Phone, OtpPurpose.ForgotPassword, verify.VerificationToken!));
    }
}
