'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PRODUCTS } from '../../lib/data';
import { fmt, subtotal } from '../../lib/utils';
import { useCart } from '../../context/CartContext';
import BtnTeal from '../ui/BtnTeal';
import BtnOutline from '../ui/BtnOutline';

export default function CartContent() {
  const router = useRouter();
  const { cart, updateQty, removeItem } = useCart();

  const sub = subtotal(cart);
  const tax = sub * 0.1;
  const total = sub + tax;

  if (cart.length === 0) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '5rem 1.5rem', textAlign: 'center' }}>
        <span style={{ fontSize: '5rem' }}>🛒</span>
        <p className="serif" style={{ fontSize: '1.75rem', fontWeight: 700, marginTop: '1rem', marginBottom: '0.5rem' }}>Your cart is empty</p>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Looks like you haven&apos;t added anything yet</p>
        <BtnTeal onClick={() => router.push('/shop')}>Start Shopping</BtnTeal>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <h1 className="serif" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Shopping Cart</h1>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {cart.map(item => {
            const p = PRODUCTS.find(x => x.id === item.id)!;
            return (
              <div key={item.id} style={{ background: '#fff', borderRadius: '1.25rem', padding: '1rem', boxShadow: '0 2px 10px rgba(0,0,0,.05)', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                <div style={{ width: 64, height: 64, borderRadius: '0.75rem', background: 'var(--teal-xs)', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: '.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                  <p style={{ fontSize: '.75rem', color: '#94a3b8', marginTop: 2 }}>{p.category}</p>
                  <p style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--teal)', marginTop: 4 }}>{fmt(p.price * item.qty)}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {([-1, 1] as const).map((d, i) => (
                    <button key={i} onClick={() => updateQty(p.id, d)}
                      style={{ width: 30, height: 30, borderRadius: '50%', border: '1.5px solid #cbd5e1', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {d < 0 ? '−' : '+'}
                    </button>
                  ))}
                  <span style={{ width: 24, textAlign: 'center', fontWeight: 700 }}>{item.qty}</span>
                </div>
                <button onClick={() => removeItem(p.id)}
                  style={{ width: 32, height: 32, borderRadius: '50%', background: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '.85rem' }}>
                  ✕
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ width: 280, flexShrink: 0 }}>
          <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,.06)', position: 'sticky', top: 76 }}>
            <h3 className="serif" style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem' }}>Order Summary</h3>
            {[['Subtotal', fmt(sub)], ['Shipping', 'FREE'], ['Tax (10%)', fmt(tax)]].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.875rem', marginBottom: '0.5rem' }}>
                <span style={{ color: '#64748b' }}>{l}</span>
                <span style={{ fontWeight: 500, color: l === 'Shipping' ? '#16a34a' : undefined }}>{v}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem' }}>
              <span>Total</span><span style={{ color: 'var(--teal)' }}>{fmt(total)}</span>
            </div>
            <BtnTeal onClick={() => router.push('/cart/checkout')} style={{ width: '100%', marginTop: '1.25rem', padding: '0.75rem' }}>
              Proceed to Checkout
            </BtnTeal>
            <BtnOutline onClick={() => router.push('/shop')} style={{ width: '100%', marginTop: '0.5rem', padding: '0.6rem' } as React.CSSProperties}>
              Continue Shopping
            </BtnOutline>
          </div>
        </div>
      </div>
    </div>
  );
}
