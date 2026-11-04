using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Primitives;
using Moq;
using PaymentService.API.DTOs;
using PaymentService.API.DTOs.Order;
using PaymentService.API.Interfaces;
using PaymentService.API.Models;
using PaymentService.API.Services;

namespace PaymentService.API.Tests;

public class PaymentsServiceTests
{
    private readonly Mock<IPaymentRepository> _repo = new();
    private readonly Mock<IOrderServiceClient> _orders = new();
    private readonly Mock<IVnPayService> _vnPay = new();
    private readonly Mock<IMoMoService> _moMo = new();
    private readonly PaymentsService _sut;

    public PaymentsServiceTests()
    {
        _sut = new PaymentsService(
            _repo.Object,
            _orders.Object,
            _vnPay.Object,
            NullLogger<PaymentsService>.Instance,
            _moMo.Object);
    }

    // ---------- helpers ----------

    private void OrderExists(int orderId, decimal finalAmount, params Payment[] existingPayments)
    {
        _orders.Setup(o => o.GetOrderAsync(orderId))
            .ReturnsAsync(new OrderDto { OrderId = orderId, FinalAmount = finalAmount });
        _repo.Setup(r => r.GetByOrderIdAsync(orderId))
            .ReturnsAsync(existingPayments.AsEnumerable());
    }

    private static Payment PendingPayment(string method = "VNPay", string txnRef = "VNP123") => new()
    {
        PaymentId = 1,
        OrderId = 20,
        Amount = 55000,
        PaymentMethod = method,
        TxnRef = txnRef,
        Status = "Pending"
    };

    private static IQueryCollection VnPayQuery(
        string txnRef = "VNP123",
        string amount = "5500000",
        string responseCode = "00",
        string transactionStatus = "00")
    {
        return new QueryCollection(new Dictionary<string, StringValues>
        {
            ["vnp_TxnRef"] = txnRef,
            ["vnp_Amount"] = amount,
            ["vnp_ResponseCode"] = responseCode,
            ["vnp_TransactionStatus"] = transactionStatus,
            ["vnp_TransactionNo"] = "14000001",
            ["vnp_BankCode"] = "NCB",
            ["vnp_SecureHash"] = "signature-checked-by-mock"
        });
    }

    // ---------- CreateAsync ----------

    [Theory]
    [InlineData("Bitcoin")]
    [InlineData("")]
    [InlineData("vnpay")] // case-sensitive
    public async Task CreateAsync_UnsupportedPaymentMethod_ThrowsArgumentException(string method)
    {
        await Assert.ThrowsAsync<ArgumentException>(() => _sut.CreateAsync(20, method));
    }

    [Fact]
    public async Task CreateAsync_InvalidOrderId_ThrowsArgumentException()
    {
        await Assert.ThrowsAsync<ArgumentException>(() => _sut.CreateAsync(0, "Cash"));
    }

    [Fact]
    public async Task CreateAsync_OrderDoesNotExist_ThrowsKeyNotFoundException()
    {
        _orders.Setup(o => o.GetOrderAsync(20)).ReturnsAsync((OrderDto?)null);

        await Assert.ThrowsAsync<KeyNotFoundException>(() => _sut.CreateAsync(20, "Cash"));
    }

    [Fact]
    public async Task CreateAsync_OrderAlreadyPaid_ThrowsInvalidOperationException()
    {
        OrderExists(20, 55000, new Payment { OrderId = 20, Status = "Completed", PaymentMethod = "Cash", TxnRef = "CASH1" });

        await Assert.ThrowsAsync<InvalidOperationException>(() => _sut.CreateAsync(20, "VNPay"));
        _repo.Verify(r => r.AddAsync(It.IsAny<Payment>()), Times.Never);
    }

    [Fact]
    public async Task CreateAsync_Cash_IsCompletedImmediatelyAndAmountComesFromOrder()
    {
        OrderExists(20, 55000);

        var payment = await _sut.CreateAsync(20, "Cash");

        Assert.Equal(55000m, payment.Amount);
        Assert.Equal("Completed", payment.Status);
        Assert.NotNull(payment.PaymentDate);
        Assert.Null(payment.ExpiredAt);
        Assert.StartsWith("CASH", payment.TxnRef);
        _repo.Verify(r => r.AddAsync(payment), Times.Once);
        _repo.Verify(r => r.SaveChangesAsync(), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_VnPay_IsPendingWithFifteenMinuteExpiry()
    {
        OrderExists(20, 55000);

        var before = DateTime.Now;
        var payment = await _sut.CreateAsync(20, "VNPay");

        Assert.Equal("Pending", payment.Status);
        Assert.Null(payment.PaymentDate);
        Assert.StartsWith("VNP", payment.TxnRef);
        Assert.NotNull(payment.ExpiredAt);
        Assert.InRange(payment.ExpiredAt!.Value, before.AddMinutes(14), before.AddMinutes(16));
    }

    // ---------- VNPay IPN ----------

    [Fact]
    public async Task ProcessVnPayIpnAsync_InvalidSignature_Returns97AndChangesNothing()
    {
        _vnPay.Setup(v => v.ValidateSignature(It.IsAny<IQueryCollection>())).Returns(false);

        var response = await _sut.ProcessVnPayIpnAsync(VnPayQuery());

        Assert.Equal("97", response.RspCode);
        _repo.Verify(r => r.UpdatePendingStatusAsync(
            It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string?>(),
            It.IsAny<string?>(), It.IsAny<string?>()), Times.Never);
    }

    [Fact]
    public async Task ProcessVnPayIpnAsync_UnknownTxnRef_Returns01()
    {
        _vnPay.Setup(v => v.ValidateSignature(It.IsAny<IQueryCollection>())).Returns(true);
        _repo.Setup(r => r.GetByTxnRefAsync("VNP123")).ReturnsAsync((Payment?)null);

        var response = await _sut.ProcessVnPayIpnAsync(VnPayQuery());

        Assert.Equal("01", response.RspCode);
    }

    [Fact]
    public async Task ProcessVnPayIpnAsync_AmountMismatch_Returns04()
    {
        _vnPay.Setup(v => v.ValidateSignature(It.IsAny<IQueryCollection>())).Returns(true);
        _repo.Setup(r => r.GetByTxnRefAsync("VNP123")).ReturnsAsync(PendingPayment());

        var response = await _sut.ProcessVnPayIpnAsync(VnPayQuery(amount: "100"));

        Assert.Equal("04", response.RspCode);
    }

    [Fact]
    public async Task ProcessVnPayIpnAsync_PaymentAlreadyProcessed_Returns02()
    {
        var payment = PendingPayment();
        payment.Status = "Completed";
        _vnPay.Setup(v => v.ValidateSignature(It.IsAny<IQueryCollection>())).Returns(true);
        _repo.Setup(r => r.GetByTxnRefAsync("VNP123")).ReturnsAsync(payment);

        var response = await _sut.ProcessVnPayIpnAsync(VnPayQuery());

        Assert.Equal("02", response.RspCode);
        _orders.Verify(o => o.UpdatePaymentStatusAsync(It.IsAny<int>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task ProcessVnPayIpnAsync_SuccessfulPayment_Returns00AndMarksOrderPaid()
    {
        _vnPay.Setup(v => v.ValidateSignature(It.IsAny<IQueryCollection>())).Returns(true);
        _repo.Setup(r => r.GetByTxnRefAsync("VNP123")).ReturnsAsync(PendingPayment());
        _repo.Setup(r => r.UpdatePendingStatusAsync("VNP123", "Completed", "14000001", "00", "NCB"))
            .ReturnsAsync(1);

        var response = await _sut.ProcessVnPayIpnAsync(VnPayQuery());

        Assert.Equal("00", response.RspCode);
        _repo.Verify(r => r.UpdatePendingStatusAsync("VNP123", "Completed", "14000001", "00", "NCB"), Times.Once);
        _orders.Verify(o => o.UpdatePaymentStatusAsync(20, "Paid"), Times.Once);
    }

    [Fact]
    public async Task ProcessVnPayIpnAsync_CustomerCancelledAtVnPay_MarksPaymentFailedAndKeepsOrderUnpaid()
    {
        _vnPay.Setup(v => v.ValidateSignature(It.IsAny<IQueryCollection>())).Returns(true);
        _repo.Setup(r => r.GetByTxnRefAsync("VNP123")).ReturnsAsync(PendingPayment());
        _repo.Setup(r => r.UpdatePendingStatusAsync("VNP123", "Failed", null, "24", "NCB"))
            .ReturnsAsync(1);

        var response = await _sut.ProcessVnPayIpnAsync(VnPayQuery(responseCode: "24", transactionStatus: "02"));

        Assert.Equal("00", response.RspCode); // VNPay only needs to know the IPN was received
        _repo.Verify(r => r.UpdatePendingStatusAsync("VNP123", "Failed", null, "24", "NCB"), Times.Once);
        _orders.Verify(o => o.UpdatePaymentStatusAsync(It.IsAny<int>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task ProcessVnPayIpnAsync_OrderServiceDown_StillReturns00()
    {
        _vnPay.Setup(v => v.ValidateSignature(It.IsAny<IQueryCollection>())).Returns(true);
        _repo.Setup(r => r.GetByTxnRefAsync("VNP123")).ReturnsAsync(PendingPayment());
        _repo.Setup(r => r.UpdatePendingStatusAsync("VNP123", "Completed", "14000001", "00", "NCB"))
            .ReturnsAsync(1);
        _orders.Setup(o => o.UpdatePaymentStatusAsync(20, "Paid"))
            .ThrowsAsync(new HttpRequestException("OrderService unavailable"));

        var response = await _sut.ProcessVnPayIpnAsync(VnPayQuery());

        Assert.Equal("00", response.RspCode);
    }

    // ---------- MoMo IPN ----------

    private static MoMoIpnRequest MoMoIpn(long amount = 55000, int resultCode = 0) => new()
    {
        OrderId = "MOMO123",
        Amount = amount,
        ResultCode = resultCode,
        TransId = 999,
        PayType = "qr",
        Signature = "signature-checked-by-mock"
    };

    [Fact]
    public async Task ProcessMoMoIpnAsync_InvalidSignature_ReturnsFalse()
    {
        _moMo.Setup(m => m.ValidateSignature(It.IsAny<MoMoIpnRequest>())).Returns(false);

        Assert.False(await _sut.ProcessMoMoIpnAsync(MoMoIpn()));
    }

    [Fact]
    public async Task ProcessMoMoIpnAsync_AmountMismatch_ReturnsFalse()
    {
        _moMo.Setup(m => m.ValidateSignature(It.IsAny<MoMoIpnRequest>())).Returns(true);
        _repo.Setup(r => r.GetByTxnRefAsync("MOMO123")).ReturnsAsync(PendingPayment("MoMo", "MOMO123"));

        Assert.False(await _sut.ProcessMoMoIpnAsync(MoMoIpn(amount: 1000)));
    }

    [Fact]
    public async Task ProcessMoMoIpnAsync_SuccessfulPayment_MarksOrderPaid()
    {
        _moMo.Setup(m => m.ValidateSignature(It.IsAny<MoMoIpnRequest>())).Returns(true);
        _repo.Setup(r => r.GetByTxnRefAsync("MOMO123")).ReturnsAsync(PendingPayment("MoMo", "MOMO123"));
        _repo.Setup(r => r.UpdatePendingStatusAsync("MOMO123", "Completed", "999", "0", "qr"))
            .ReturnsAsync(1);

        var ok = await _sut.ProcessMoMoIpnAsync(MoMoIpn());

        Assert.True(ok);
        _orders.Verify(o => o.UpdatePaymentStatusAsync(20, "Paid"), Times.Once);
    }

    // ---------- Delete ----------

    [Fact]
    public async Task DeleteAsync_PaymentDoesNotExist_ReturnsFalse()
    {
        _repo.Setup(r => r.GetByIdAsync(1)).ReturnsAsync((Payment?)null);

        Assert.False(await _sut.DeleteAsync(1));
        _repo.Verify(r => r.Delete(It.IsAny<Payment>()), Times.Never);
    }
}
