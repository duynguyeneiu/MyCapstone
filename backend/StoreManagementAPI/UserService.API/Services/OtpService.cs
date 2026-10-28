using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using UserService.API.Helpers;
using UserService.API.Interfaces;
using UserService.API.Models.Otp;

namespace UserService.API.Services
{
    public class OtpService : IOtpService
    {
        private readonly IMemoryCache _cache;
        private readonly ISmsSender _smsSender;
        private readonly OtpOptions _options;
        private readonly ILogger<OtpService> _logger;

        public OtpService(
            IMemoryCache cache,
            ISmsSender smsSender,
            IOptions<OtpOptions> options,
            ILogger<OtpService> logger)
        {
            _cache = cache;
            _smsSender = smsSender;
            _options = options.Value;
            _logger = logger;
        }

        public async Task<OtpSendResult> SendAsync(string phone, OtpPurpose purpose)
        {
            // 1. Chuẩn hóa SĐT
            var normalized = PhoneHelper.Normalize(phone);
            if (normalized == null)
                return OtpSendResult.Fail("Số điện thoại không hợp lệ.");

            // 2. Chặn gửi lại quá nhanh
            var cooldownKey = CooldownKey(normalized, purpose);
            if (_cache.TryGetValue(cooldownKey, out DateTime lastSentAt))
            {
                var remaining = _options.ResendCooldownSeconds
                    - (int)(DateTime.UtcNow - lastSentAt).TotalSeconds;

                if (remaining > 0)
                    return OtpSendResult.Fail(
                        $"Vui lòng đợi {remaining} giây để gửi lại.", remaining);
            }

            // 3. Sinh mã + lưu hash
            var code = GenerateCode();

            _cache.Set(
                OtpKey(normalized, purpose),
                new OtpEntry { CodeHash = Hash(code), Attempts = 0 },
                TimeSpan.FromMinutes(_options.ExpiryMinutes));

            _cache.Set(
                cooldownKey,
                DateTime.UtcNow,
                TimeSpan.FromSeconds(_options.ResendCooldownSeconds));

      
            // 4. Gửi SMS - lỗi thì hủy OTP + cooldown để người dùng gửi lại được ngay
            try
            {
                await _smsSender.SendAsync(
                    normalized,
                    string.Format(_options.MessageTemplate, code, _options.ExpiryMinutes));
            }
            catch (Exception ex)
            {
                _cache.Remove(OtpKey(normalized, purpose));
                _cache.Remove(cooldownKey);
                _logger.LogError(ex, "Gửi OTP thất bại tới {Phone}", normalized);
                return OtpSendResult.Fail("Không gửi được mã OTP. Vui lòng thử lại sau.");
            }

            return OtpSendResult.Ok(_options.ResendCooldownSeconds);
        }
        public Task<OtpVerifyResult> VerifyAsync(string phone, OtpPurpose purpose, string code)
        {
            var normalized = PhoneHelper.Normalize(phone);
            if (normalized == null || string.IsNullOrWhiteSpace(code))
                return Task.FromResult(OtpVerifyResult.Fail("Dữ liệu không hợp lệ."));

            var otpKey = OtpKey(normalized, purpose);

            // 1. Không có / hết hạn
            if (!_cache.TryGetValue(otpKey, out OtpEntry? entry) || entry == null)
                return Task.FromResult(OtpVerifyResult.Fail(
                    "Mã OTP đã hết hạn hoặc không tồn tại. Vui lòng gửi lại."));

            // 2. Đúng mã
            if (SecureEquals(Hash(code.Trim()), entry.CodeHash))
            {
                _cache.Remove(otpKey); // one-time

                var token = Guid.NewGuid().ToString("N");
                _cache.Set(
                    VerifiedKey(normalized, purpose),
                    token,
                    TimeSpan.FromMinutes(_options.VerificationTokenMinutes));

                return Task.FromResult(OtpVerifyResult.Ok(token));
            }

            // 3. Sai mã
            entry.Attempts++;

            if (entry.Attempts >= _options.MaxAttempts)
            {
                _cache.Remove(otpKey);
                return Task.FromResult(OtpVerifyResult.Fail(
                    "Bạn đã nhập sai quá số lần cho phép. Vui lòng gửi lại mã."));
            }

            var left = _options.MaxAttempts - entry.Attempts;
            return Task.FromResult(OtpVerifyResult.Fail(
                $"Mã OTP không đúng. Còn {left} lần thử."));
        }

        public bool ConsumeVerificationToken(string phone, OtpPurpose purpose, string token)
        {
            var normalized = PhoneHelper.Normalize(phone);
            if (normalized == null || string.IsNullOrWhiteSpace(token))
                return false;

            var key = VerifiedKey(normalized, purpose);

            if (!_cache.TryGetValue(key, out string? stored) || stored == null)
                return false;

            if (!SecureEquals(stored, token))
                return false;

            _cache.Remove(key); // dùng 1 lần
            return true;
        }

        // ===== Helpers =====


        private string GenerateCode()
        {
            var max = (int)Math.Pow(10, _options.Length);
            return RandomNumberGenerator
                .GetInt32(0, max)
                .ToString($"D{_options.Length}");
        }
        private static string VerifiedKey(string phone, OtpPurpose purpose) =>
              $"otp:verified:{purpose}:{phone}";

        private static bool SecureEquals(string a, string b) =>
            CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(a),
                Encoding.UTF8.GetBytes(b));

        internal static string Hash(string code) =>
            Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(code)));

        internal static string OtpKey(string phone, OtpPurpose purpose) =>
            $"otp:{purpose}:{phone}";

        private static string CooldownKey(string phone, OtpPurpose purpose) =>
            $"otp:cooldown:{purpose}:{phone}";
    }
}