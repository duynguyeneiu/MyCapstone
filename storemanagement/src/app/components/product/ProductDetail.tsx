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
          <div style={{ background: 'var(--teal-xs)', borderRadius: '1.5rem', height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8rem' }}>
            {p.emoji}
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
            {[['🚚', 'Free Shipping'], ['↩️', 'Easy Returns'], ['🔒', 'Secure Pay']].map(([icon, label]) => (
              <div key={label} style={{ background: 'var(--teal-xs)', borderRadius: '0.75rem', padding: '0.75rem', textAlign: 'center', fontSize: '.8rem' }}>
                <span style={{ fontSize: '1.25rem', display: 'block' }}>{icon}</span>{label}
              </div>
            ))}
          </div>
        </div>
      </div>

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
