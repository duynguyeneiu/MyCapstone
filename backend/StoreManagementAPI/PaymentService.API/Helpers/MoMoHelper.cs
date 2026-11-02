using System.Security.Cryptography;
using System.Text;

namespace PaymentService.API.Helpers;

public static class MoMoHelper
{
    public static string HmacSha256(string key, string data)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
        return Convert.ToHexString(hash).ToLower();
    }
}