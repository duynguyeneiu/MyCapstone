import Link from 'next/link'
import { orderService } from '@/src/services/orderService'

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await orderService.getById(Number(id)).catch(() => null);

  if (!order) {
    return (
      <section className="container py-5 od-wrap">
        <div className="od-card">
          <div className="od-section">
            <h6>Order not found</h6>
            <Link href="/orders" className="od-btn-back">← Back to Orders</Link>
          </div>
        </div>
      </section>
    );
  }

  const subTotal = order.items.reduce((s, i) => s + i.subtotal, 0)

  return (
    <section className="container py-5 od-wrap">
      <div className="od-card">

        {/* Header */}
        <div className="od-header">
          <div>
            <h5>Order #{order.orderNumber}</h5>
            <small>
              Placed on{' '}
              {new Date(order.orderDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </small>
            <span className="od-status">{order.orderStatus}</span>
          </div>
        </div>

        {/* Items */}
        <div className="od-section">
          <h6>Items</h6>
          {order.items.map((item, idx) => (
            <div key={idx} className="od-item">
              <span>
                {item.productName}{' '}
                <small className="text-muted">({item.quantity})</small>
              </span>
              <strong>{item.subtotal.toFixed(2)} $</strong>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="od-section">
          <h6>Summary</h6>
          <div className="od-summary">
            <span>Subtotal</span>
            <span>{subTotal.toFixed(2)} $</span>
          </div>
          <div className="od-summary">
            <span>Shipping</span>
            <span>0 $</span>
          </div>
          <div className="od-summary od-total">
            <span>Total</span>
            <span>{order.totalAmount.toFixed(2)} $</span>
          </div>
        </div>

        {/* Shipping */}
        <div className="od-section od-shipping">
          <h6>Shipping Information</h6>
          <p>{order.receiverName} – {order.receiverPhone}</p>
          <p>{order.shippingAddress}</p>
        </div>

        {/* Action */}
        <div className="od-section od-action">
          <Link href="/profile" className="od-btn-back">← Back</Link>
        </div>

      </div>
    </section>
  )
}
