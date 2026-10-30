using System.Net;
using System.Security.Cryptography;
using System.Text;

namespace PaymentService.API.Helpers;

public static class VnPayHelper
{
    // Sắp xếp key theo Ordinal, bỏ value rỗng, URL-encode → "a=1&b=2"
    public static string BuildQuery(IDictionary<string, string> data)
    {
        return string.Join("&", data
            .Where(kv => !string.IsNullOrEmpty(kv.Value))
            .OrderBy(kv => kv.Key, StringComparer.Ordinal)
            .Select(kv => $"{WebUtility.UrlEncode(kv.Key)}={WebUtility.UrlEncode(kv.Value)}"));
    }

    public static string HmacSha512(string key, string data)
    {
        using var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(key));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
        return Convert.ToHexString(hash).ToLower();
    }
}