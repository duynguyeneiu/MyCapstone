using OrderServiceAPI.DTOs.Invoice;
using OrderServiceAPI.Interfaces;
using OrderServiceAPI.Models;

namespace OrderServiceAPI.Services
{
    public class InvoiceService: IInvoiceService
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IInvoiceRepository _invoiceRepository;
        public async Task<InvoiceDto> CreateFromOrderAsync(int orderId, int staffUserId)
        {
            var order = await _orderRepository.GetOrderByIdAsync(orderId);

            if (order == null)
                throw new Exception("Order not found.");

            if (!order.OrderDetails.Any())
                throw new Exception("Order has no items.");

            var invoice = new Invoice
            {
                InvoiceDate = DateTime.Now,
                UserId = order.CustomerUserId,
                StaffUserId = staffUserId,
                TotalAmount = order.TotalAmount,
                Discount = order.Discount,
                Vat = order.Vat,
                FinalAmount = order.FinalAmount,
                PaymentMethod = order.PaymentMethod,
                PromotionId = order.PromotionId,
                OrderType = order.OrderType,
                ShippingAddress = order.ShippingAddress,
                OrderStatus = "Completed",
                CreatedAt = DateTime.Now
            };

            await _invoiceRepository.AddInvoiceAsync(invoice);
            await _invoiceRepository.SaveChangesAsync();

            var details = order.OrderDetails.Select(item => new InvoiceDetail
            {
                InvoiceId = invoice.InvoiceId,
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                Discount = item.Discount,
                Subtotal = item.Subtotal,
                CreatedAt = DateTime.Now
            }).ToList();

            await _invoiceRepository.AddInvoiceDetailRangeAsync(details);

            order.OrderStatus = "Completed";
            order.UpdatedAt = DateTime.Now;

            await _invoiceRepository.SaveChangesAsync();

            return new InvoiceDto
            {
                InvoiceId = invoice.InvoiceId,
                OrderId = order.OrderId,
                FinalAmount = invoice.FinalAmount,
                PaymentMethod = invoice.PaymentMethod,
                OrderStatus = invoice.OrderStatus
            };
        }
    }
}
