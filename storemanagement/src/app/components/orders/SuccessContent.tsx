'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PRODUCTS } from '../../lib/data';
import { fmt, subtotal } from '../../lib/utils';
import { useOrders } from '../../context/OrderContext';
import BtnTeal from '../ui/BtnTeal';

interface SuccessContentProps {
  orderId: string;
}

export default function SuccessContent({ orderId }: SuccessContentProps) {
  const router = useRouter();
  const { prevCart } = useOrders();
  const total = subtotal(prevCart) * 1.1;

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '5rem 1.5rem', textAlign: 'center' }}>
      <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'var(--teal-xs)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '52px', color: 'var(--teal)', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
      </div>
      <h1 className="serif" style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>Order Placed!</h1>
      <p style={{ color: '#64748b', marginBottom: '0.5rem' }}>Thank you for your purchase.</p>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>
        Your order <strong style={{ color: '#1e293b' }}>{orderId}</strong> is being processed and will be delivered within 24 hours.
      </p>

      {prevCart.length > 0 && (
        <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,.06)', textAlign: 'left', marginBottom: '2rem' }}>
          <p style={{ fontWeight: 600, fontSize: '.9rem', marginBottom: '0.75rem' }}>Order Details</p>
          {prevCart.map(item => {
            const p = PRODUCTS.find(x => x.id === item.id)!;
            return (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '.875rem', marginBottom: '0.4rem', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '0.4rem', background: 'var(--teal-xs)', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 3 }} />
                  </div>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name} ×{item.qty}</span>
                </div>
                <span style={{ fontWeight: 600 }}>{fmt(p.price * item.qty)}</span>
              </div>
            );
          })}
          <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '0.75rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
            <span>Total Paid</span>
            <span style={{ color: 'var(--teal)' }}>{fmt(total)}</span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <BtnTeal onClick={() => router.push('/')} style={{ padding: '0.75rem 2.5rem' }}>Back to Home</BtnTeal>
        <BtnTeal onClick={() => router.push('/orders')} style={{ padding: '0.75rem 2.5rem', background: 'var(--teal-dk)' }}>View Orders</BtnTeal>
      </div>
    </div>
  );
}
