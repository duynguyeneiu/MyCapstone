'use client';

// Client component: the token lives in localStorage, so the order must be
// fetched in the browser (a server component would call the API without it → 401).
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { orderService, Order } from '@/src/services/orderService';
import { fmt } from '@/src/lib/utils';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getById(Number(id))
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <section className="container py-5 od-wrap"><p>Loading order…</p></section>;
  }

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

  return (
    <section className="container py-5 od-wrap">
      <div className="od-card">

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

        <div className="od-section">
          <h6>Items</h6>
          {order.items.map((item, idx) => (
            <div key={idx} className="od-item">
              <span>
                {item.productName}{' '}
                <small className="text-muted">({item.quantity})</small>
              </span>
              <strong>{fmt(item.subtotal)}</strong>
            </div>
          ))}
        </div>

        <div className="od-section">
          <h6>Summary</h6>
          <div className="od-summary">
            <span>Subtotal</span>
            <span>{fmt(order.totalAmount)}</span>
          </div>
          {order.discount > 0 && (
            <div className="od-summary">
              <span>Discount</span>
              <span>-{fmt(order.discount)}</span>
            </div>
          )}
          <div className="od-summary">
            <span>Shipping</span>
            <span>{fmt(order.shippingFee)}</span>
          </div>
          <div className="od-summary od-total">
            <span>Total</span>
            <span>{fmt(order.finalAmount)}</span>
          </div>
        </div>

        <div className="od-section od-shipping">
          <h6>Shipping Information</h6>
          <p>{order.receiverName} – {order.receiverPhone}</p>
          <p>{order.shippingAddress}</p>
        </div>

        <div className="od-section od-action">
          <Link href="/orders" className="od-btn-back">← Back to Orders</Link>
        </div>

      </div>
    </section>
  );
}
