'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PaymentMethod } from '../../lib/types';
import { fmt, subtotal } from '../../lib/utils';
import { PRODUCTS } from '../../lib/data';
import { useCart } from '../../context/CartContext';
import { useOrders } from '../../context/OrderContext';
import BtnTeal from '../ui/BtnTeal';
import Badge from '../ui/Badge';
import QRModal from '../ui/QRModal';

export default function CheckoutContent() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const [payment, setPayment] = useState<PaymentMethod>('card');
  const [showQR, setShowQR] = useState(false);

  const sub = subtotal(cart);
  const tax = sub * 0.1;
  const total = sub + tax;

  const payOpts: { id: PaymentMethod; label: string; sub: string; icon: string }[] = [
    { id: 'card', label: 'Credit / Debit Card', sub: 'Visa, Mastercard, JCB', icon: '💳' },
    { id: 'momo', label: 'MoMo',                sub: 'Scan QR to pay instantly', icon: '💜' },
    { id: 'bank', label: 'Bank Transfer',        sub: 'Scan QR via banking app',  icon: '🏦' },
    { id: 'cod',  label: 'Cash on Delivery',     sub: 'Pay when you receive',      icon: '📦' },
  ];

  const handlePlaceOrder = () => {
    const oid = placeOrder(cart, payment);
    clearCart();
    router.push(`/orders/success?id=${oid}`);
  };

  const handleSubmit = () => {
    if (payment === 'momo' || payment === 'bank') {
      setShowQR(true);
    } else {
      handlePlaceOrder();
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      {showQR && (
        <QRModal
          method={payment}
          total={total}
          onClose={() => setShowQR(false)}
          onConfirm={() => { setShowQR(false); handlePlaceOrder(); }}
        />
      )}
      <h1 className="serif" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Checkout</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>Complete your order details below</p>

      {/* Steps */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '2.5rem' }}>
        {[['1', 'Shipping', 'var(--teal)'], ['2', 'Payment', 'var(--teal)'], ['3', 'Review', '#e2e8f0']].map(([n, l, bg], i) => (
          <span key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {i > 0 && <span style={{ flex: 1, height: 2, width: 40, background: '#e2e8f0' }} />}
            <span style={{ width: 32, height: 32, borderRadius: '50%', background: bg, color: bg === '#e2e8f0' ? '#94a3b8' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '.875rem', flexShrink: 0 }}>{n}</span>
            <span style={{ fontSize: '.875rem', fontWeight: 600, color: bg === '#e2e8f0' ? '#94a3b8' : 'var(--teal)' }}>{l}</span>
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Shipping */}
          <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
            <h3 className="serif" style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '1.25rem' }}>Shipping Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {([['First Name', 'text', 'John'], ['Last Name', 'text', 'Doe'], ['Email', 'email', 'john@example.com', '2'], ['Phone', 'tel', '+84 912 345 678', '2'], ['Address', 'text', '123 Main Street', '2'], ['City', 'text', 'Ho Chi Minh City'], ['Zip Code', 'text', '70000']] as [string, string, string, string?][]).map(([label, type, ph, span]) => (
                <div key={label} style={{ gridColumn: span ? `span ${span}` : undefined }}>
                  <label style={{ fontSize: '.75rem', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: 4 }}>{label}</label>
                  <input type={type} placeholder={ph} />
                </div>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
            <h3 className="serif" style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '1.25rem' }}>Payment Method</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {payOpts.map(opt => (
                <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '0.75rem', border: `2px solid ${payment === opt.id ? 'var(--teal)' : '#e2e8f0'}`, background: payment === opt.id ? 'var(--teal-xs)' : '#fff', cursor: 'pointer', transition: '.2s' }}>
                  <input type="radio" name="pay" value={opt.id} checked={payment === opt.id} onChange={() => setPayment(opt.id)} style={{ accentColor: 'var(--teal)', width: 16, height: 16 }} />
                  <span style={{ fontSize: '1.5rem' }}>{opt.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, fontSize: '.9rem' }}>{opt.label}</p>
                    <p style={{ fontSize: '.75rem', color: '#64748b' }}>{opt.sub}</p>
                  </div>
                  {opt.id === 'momo' && <Badge style={{ background: '#fdf2f8', color: '#9d174d' }}>Popular</Badge>}
                </label>
              ))}

              {payment === 'card' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', paddingLeft: '0.5rem' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '.75rem', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: 4 }}>Card Number</label>
                    <input type="text" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div>
                    <label style={{ fontSize: '.75rem', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: 4 }}>Expiry</label>
                    <input type="text" placeholder="MM / YY" />
                  </div>
                  <div>
                    <label style={{ fontSize: '.75rem', fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: 4 }}>CVV</label>
                    <input type="text" placeholder="•••" />
                  </div>
                </div>
              )}

              {(payment === 'momo' || payment === 'bank') && (
                <BtnTeal onClick={() => setShowQR(true)} style={{ width: '100%', padding: '0.75rem' }}>
                  {payment === 'momo' ? '💜 Tap to View MoMo QR Code' : '🏦 Tap to View Bank Transfer QR'}
                </BtnTeal>
              )}
            </div>
          </div>
        </div>

        {/* Summary sidebar */}
        <div style={{ width: 280, flexShrink: 0 }}>
          <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,.06)', position: 'sticky', top: 76 }}>
            <h3 className="serif" style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem' }}>Your Order</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: 200, overflowY: 'auto', marginBottom: '1rem' }}>
              {cart.map(item => {
                const p = PRODUCTS.find(x => x.id === item.id)!;
                return (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '1.25rem' }}>{p.emoji}</span>
                    <span style={{ flex: 1, fontSize: '.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name} ×{item.qty}</span>
                    <span style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--teal)' }}>{fmt(p.price * item.qty)}</span>
                  </div>
                );
              })}
            </div>
            {[['Subtotal', fmt(sub)], ['Shipping', 'FREE'], ['Tax', fmt(tax)]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.875rem', marginBottom: '0.4rem' }}>
                <span style={{ color: '#64748b' }}>{l}</span>
                <span style={{ color: l === 'Shipping' ? '#16a34a' : undefined, fontWeight: 500 }}>{v}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem' }}>
              <span>Total</span><span style={{ color: 'var(--teal)' }}>{fmt(total)}</span>
            </div>
            <BtnTeal onClick={handleSubmit} style={{ width: '100%', marginTop: '1.25rem', padding: '0.75rem' }}>Place Order ✓</BtnTeal>
            <p style={{ textAlign: 'center', fontSize: '.75rem', color: '#94a3b8', marginTop: '0.75rem' }}>🔒 Secured by 256-bit SSL</p>
          </div>
        </div>
      </div>
    </div>
  );
}
