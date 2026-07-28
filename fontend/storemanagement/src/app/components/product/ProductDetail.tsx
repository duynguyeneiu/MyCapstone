'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PRODUCTS } from '../../lib/data';
import { fmt, disc } from '../../lib/utils';
import { useCart } from '../../context/CartContext';
import Badge from '../ui/Badge';
import StarRow from '../ui/StarRow';
import BtnTeal from '../ui/BtnTeal';
import BtnOutline from '../ui/BtnOutline';
import ProductCard from '../ui/ProductCard';
import ReviewSection from './ReviewSection';

interface ProductDetailProps {
  productId: number;
}

export default function ProductDetail({ productId }: ProductDetailProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);

  const p = PRODUCTS.find(x => x.id === productId);
  if (!p) return <div style={{ padding: '5rem', textAlign: 'center' }}>Product not found.</div>;

  const d = disc(p);
  const related = PRODUCTS.filter(r => r.category === p.category && r.id !== p.id).slice(0, 4);

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) addToCart(p.id);
  };

  const handleBuyNow = () => {
    handleAdd();
    router.push('/cart');
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.875rem', color: '#64748b', marginBottom: '1.5rem' }}>
        {[['/', 'Home'], ['/shop', 'Products']].map(([href, label]) => (
          <span key={href} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ cursor: 'pointer', color: 'var(--teal)' }} onClick={() => router.push(href)}>{label}</span>
            <span>/</span>
          </span>
        ))}
        <span style={{ color: '#1e293b', fontWeight: 500 }}>{p.name}</span>
      </div>

      <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ background: 'var(--teal-xs)', borderRadius: '1.5rem', height: 380, overflow: 'hidden' }}>
            <img
              src={p.image}
              alt={p.name}
              style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '1.5rem' }}
            />
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 280 }}>
          <Badge style={{ marginBottom: '0.5rem' }}>{p.category}</Badge>
          <h1 className="serif" style={{ fontSize: '1.85rem', fontWeight: 700, margin: '.5rem 0 .75rem' }}>{p.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
            <StarRow rating={p.rating} size="text-lg" />
            <span style={{ fontSize: '.875rem', color: '#64748b' }}>{p.rating} ({p.reviews} reviews)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: '1.25rem' }}>
            <span className="serif" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--teal)' }}>{fmt(p.price)}</span>
            {p.original && <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '1.1rem' }}>{fmt(p.original)}</span>}
            {d > 0 && <span style={{ background: '#fef9c3', color: '#854d0e', borderRadius: 9999, padding: '.15rem .65rem', fontSize: '.75rem', fontWeight: 600 }}>-{d}% OFF</span>}
          </div>
          <p style={{ color: '#4b5563', lineHeight: 1.7, marginBottom: '1.5rem' }}>{p.desc}</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <span style={{ fontWeight: 600, fontSize: '.875rem' }}>Quantity</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {([-1, 1] as const).map((delta, i) => (
                <button key={i} onClick={() => setQty(q => Math.max(1, q + delta))}
                  style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #cbd5e1', background: '#fff', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  {delta < 0 ? '−' : '+'}
                </button>
              ))}
              <span style={{ width: 32, textAlign: 'center', fontWeight: 700, fontSize: '1rem' }}>{qty}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <BtnTeal onClick={handleAdd} style={{ flex: 1, padding: '0.75rem' }}>Add to Cart 🛒</BtnTeal>
            <BtnOutline onClick={handleBuyNow} style={{ flex: 1, padding: '0.75rem' } as React.CSSProperties}>Buy Now</BtnOutline>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.75rem' }}>
            {[
              { icon: 'local_shipping', label: 'Free Shipping',  sub: 'On all orders',      iconBg: '#d1fae5', iconColor: '#065f46' },
              { icon: 'autorenew',      label: 'Easy Returns',   sub: '30-day policy',       iconBg: '#fef3c7', iconColor: '#92400e' },
              { icon: 'shield',         label: 'Secure Pay',     sub: '256-bit encryption',  iconBg: '#dbeafe', iconColor: '#1e40af' },
            ].map(({ icon, label, sub, iconBg, iconColor }) => (
              <div key={label} style={{ background: '#fff', borderRadius: '1rem', padding: '1.25rem 0.75rem', textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: '0 1px 6px rgba(0,0,0,.05)' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.375rem', color: iconColor }}>{icon}</span>
                </div>
                <p style={{ fontWeight: 700, fontSize: '.875rem', color: '#1e293b', marginBottom: '0.2rem' }}>{label}</p>
                <p style={{ fontSize: '.775rem', color: '#64748b' }}>{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ReviewSection productId={p.id} rating={p.rating} reviewCount={p.reviews} />

      {related.length > 0 && (
        <div style={{ marginTop: '3.5rem' }}>
          <h2 className="serif" style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>You Might Also Like</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '1.25rem' }}>
            {related.map(r => <ProductCard key={r.id} p={r} />)}
          </div>
        </div>
      )}
    </div>
  );
}
