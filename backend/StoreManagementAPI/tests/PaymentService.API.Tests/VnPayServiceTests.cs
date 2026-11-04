using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Primitives;
using PaymentService.API.Helpers;
using PaymentService.API.Models;
using PaymentService.API.Services;

namespace PaymentService.API.Tests;

// Uses the real VnPayService (no mocks): checks that the HMAC-SHA512 signature
// is created and verified exactly as the VNPay specification requires.
public class VnPayServiceTests
{
    private const string Secret = "UNITTESTHASHSECRET0123456789ABCD";

    private readonly VnPayService _sut = new(Options.Create(new VnPayOptions
    {
        TmnCode = "TEST0001",
        HashSecret = Secret,
        BaseUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
        ReturnUrl = "http://localhost:5003/api/Payment/vnpay-return"
    }));

    private static Dictionary<string, string> SampleIpnData() => new()
    {
        ["vnp_TmnCode"] = "TEST0001",
        ["vnp_Amount"] = "5500000",
        ["vnp_TxnRef"] = "VNP123",
        ["vnp_ResponseCode"] = "00",
        ["vnp_TransactionStatus"] = "00",
        ["vnp_TransactionNo"] = "14000001",
        ["vnp_BankCode"] = "NCB",
        ["vnp_OrderInfo"] = "Thanh toan don hang 20"
    };

    private static IQueryCollection ToQuery(Dictionary<string, string> data, string? secureHash)
    {
        var dict = data.ToDictionary(kv => kv.Key, kv => new StringValues(kv.Value));
        if (secureHash != null)
            dict["vnp_SecureHash"] = secureHash;
        return new QueryCollection(dict);
    }

    private static string Sign(Dictionary<string, string> data) =>
        VnPayHelper.HmacSha512(Secret, VnPayHelper.BuildQuery(data));

    [Fact]
    public void ValidateSignature_CorrectlySignedQuery_ReturnsTrue()
    {
        var data = SampleIpnData();

        Assert.True(_sut.ValidateSignature(ToQuery(data, Sign(data))));
    }

    [Fact]
    public void ValidateSignature_AmountTamperedAfterSigning_ReturnsFalse()
    {
        var data = SampleIpnData();
        var hash = Sign(data);
        data["vnp_Amount"] = "100"; // attacker changes the amount

        Assert.False(_sut.ValidateSignature(ToQuery(data, hash)));
    }

    [Fact]
    public void ValidateSignature_MissingSecureHash_ReturnsFalse()
    {
        Assert.False(_sut.ValidateSignature(ToQuery(SampleIpnData(), secureHash: null)));
    }

    [Fact]
    public void ValidateSignature_SignedWithAnotherSecret_ReturnsFalse()
    {
        var data = SampleIpnData();
        var foreignHash = VnPayHelper.HmacSha512("ANOTHER-MERCHANT-SECRET", VnPayHelper.BuildQuery(data));

        Assert.False(_sut.ValidateSignature(ToQuery(data, foreignHash)));
    }

    [Fact]
    public void CreatePaymentUrl_ContainsAmountTimes100AndRequiredFields()
    {
        var payment = new Payment { OrderId = 20, Amount = 55000, TxnRef = "VNP123", PaymentMethod = "VNPay", Status = "Pending" };

        var url = _sut.CreatePaymentUrl(payment, "127.0.0.1");

        Assert.StartsWith("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?", url);
        Assert.Contains("vnp_Amount=5500000", url);
        Assert.Contains("vnp_TxnRef=VNP123", url);
        Assert.Contains("vnp_TmnCode=TEST0001", url);
        Assert.Contains("vnp_SecureHash=", url);
    }

    [Fact]
    public void CreatePaymentUrl_GeneratedUrl_PassesOwnSignatureValidation()
    {
        var payment = new Payment { OrderId = 20, Amount = 55000, TxnRef = "VNP123", PaymentMethod = "VNPay", Status = "Pending" };

        var url = _sut.CreatePaymentUrl(payment, "127.0.0.1");
        var query = new QueryCollection(QueryHelpers.ParseQuery(new Uri(url).Query));

        Assert.True(_sut.ValidateSignature(query));
    }
}
