using System.Text.RegularExpressions;

namespace UserService.API.Helpers
{
    public static class PhoneHelper
    {
        // Đưa về dạng 0xxxxxxxxx (10 số). Trả null nếu không hợp lệ.
        public static string? Normalize(string? phone)
        {
            if (string.IsNullOrWhiteSpace(phone)) return null;

            var digits = Regex.Replace(phone, @"[\s\-\.\(\)]", "");

            if (digits.StartsWith("+84"))
                digits = "0" + digits[3..];
            else if (digits.StartsWith("84") && digits.Length == 11)
                digits = "0" + digits[2..];

            return Regex.IsMatch(digits, @"^0\d{9}$") ? digits : null;
        }
    }
}