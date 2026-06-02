'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PRODUCTS } from '../../lib/data';
import { Category } from '../../lib/types';
import Badge from '../ui/Badge';
import BtnTeal from '../ui/BtnTeal';
import BtnOutline from '../ui/BtnOutline';
import ProductCard from '../ui/ProductCard';

export default function HomeContent() {
  const router = useRouter();
  const featured = PRODUCTS.filter(p => p.rating >= 4.7).slice(0, 4);

  const catCards = [
    { cat: 'appliances' as Category, label: 'Home Appliances',    sub: 'Air purifiers, blenders & more', emoji: '🏠', grad: 'linear-gradient(135deg,#00694c,#004d38)' },
    { cat: 'food'       as Category, label: 'Food & Drinks',      sub: 'Organic, gourmet & everyday',    emoji: '🍱', grad: 'linear-gradient(135deg,#f59e0b,#b47b10)' },
    { cat: 'beauty'     as Category, label: 'Beauty & Cosmetics', sub: 'Skincare, makeup & wellness',    emoji: '💄', grad: 'linear-gradient(135deg,#00694c,#f59e0b)'   },
  ];

  const stats = [['500+', 'Products'], ['50K+', 'Customers'], ['4.9★', 'Avg Rating'], ['24h', 'Delivery']];

  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg,#00694c 0%,#004d38 50%,#003028 100%)', minHeight: 520, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: .08, backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><circle cx='10' cy='10' r='1.5' fill='white'/></svg>")` }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '5rem 1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2.5rem', position: 'relative', zIndex: 1 }}>
          <div className="fade-up" style={{ flex: 1, minWidth: 280, color: '#fff' }}>
            <Badge style={{ background: 'rgba(255,255,255,.2)', color: '#fff', marginBottom: '1rem', display: 'inline-block' }}>✨ New Arrivals Every Week</Badge>
            <h1 className="serif" style={{ fontSize: 'clamp(2.5rem,5vw,4rem)', fontWeight: 700, lineHeight: 1.15, marginBottom: '1rem' }}>
              Fresh Finds<br /><span style={{ color: 'var(--teal-lt)' }}>Delivered</span> Daily
            </h1>
            <p style={{ color: '#b8e0cc', fontSize: '1.1rem', marginBottom: '2rem', maxWidth: 420 }}>
              Home appliances, gourmet food & drinks, and premium beauty products — all in one place.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <BtnTeal onClick={() => router.push('/shop')} style={{ background: '#fff', color: 'var(--teal-dk)' }}>Shop Now</BtnTeal>
              <BtnOutline onClick={() => router.push('/shop')}><span style={{ color: '#fff' }}>View Deals</span></BtnOutline>
            </div>
          </div>
          <div className="fade-up d2" style={{ flex: 1, display: 'flex', justifyContent: 'center', minWidth: 220 }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: 224, height: 224, borderRadius: '1.5rem', background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>
                <span style={{ fontSize: '4.5rem' }}>🛍️</span>
                <span className="serif" style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600 }}>500+ Products</span>
              </div>
              {[{ emoji: '🏠', label: 'Appliances', top: -24, right: -32 }, { emoji: '💄', label: 'Beauty', bottom: -24, left: -32 }].map((f, i) => (
                <div key={i} style={{ position: 'absolute', width: 96, height: 96, borderRadius: '1rem', background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.25)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', top: (f as any).top, right: (f as any).right, bottom: (f as any).bottom, left: (f as any).left }}>
                  <span style={{ fontSize: '2rem' }}>{f.emoji}</span>
                  <span style={{ color: '#fff', fontSize: '.75rem', fontWeight: 500, marginTop: 4 }}>{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', overflow: 'hidden', lineHeight: 0 }}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ height: 60, width: '100%', display: 'block' }}>
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="var(--teal-xs)" />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '2.5rem 1.5rem', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '1.25rem' }}>
          {stats.map(([v, l], i) => (
            <div key={i} style={{ background: '#fff', borderRadius: '1rem', padding: '1.25rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
              <div className="serif" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--teal)' }}>{v}</div>
              <div style={{ fontSize: '.875rem', color: '#64748b', marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '3.5rem 1.5rem', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <h2 className="serif" style={{ fontSize: '2rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.5rem' }}>Shop by Category</h2>
          <p style={{ color: '#64748b', textAlign: 'center', marginBottom: '2.5rem' }}>Find exactly what you need</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1.25rem' }}>
            {catCards.map(c => (
              <button
                key={c.cat}
                onClick={() => router.push(`/shop?category=${c.cat}`)}
                style={{ background: c.grad, borderRadius: '1.5rem', padding: '2rem', textAlign: 'left', border: 'none', cursor: 'pointer', minHeight: 180, position: 'relative', overflow: 'hidden', transition: 'transform .2s' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = '')}
              >
                <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '0.75rem' }}>{c.emoji}</span>
                <h3 className="serif" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff' }}>{c.label}</h3>
                <p style={{ color: 'rgba(255,255,255,.75)', fontSize: '.875rem', marginTop: '0.25rem' }}>{c.sub}</p>
                <div style={{ position: 'absolute', bottom: -16, right: -16, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,.1)' }} />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section style={{ padding: '3.5rem 1.5rem', background: '#fff' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div>
              <h2 className="serif" style={{ fontSize: '2rem', fontWeight: 700 }}>Featured Products</h2>
              <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Handpicked just for you</p>
            </div>
            <BtnOutline onClick={() => router.push('/shop')}>View All</BtnOutline>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1.25rem' }}>
            {featured.map(p => <ProductCard key={p.id} p={p} />)}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section style={{ padding: '3.5rem 1.5rem', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ background: 'linear-gradient(135deg,#00694c,#003028)', borderRadius: '1.5rem', padding: '4rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, opacity: .05, backgroundImage: 'repeating-linear-gradient(45deg,#fff,#fff 1px,transparent 1px,transparent 10px)' }} />
            <h2 className="serif" style={{ fontSize: '2.25rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem', position: 'relative' }}>Get 20% Off Your First Order</h2>
            <p style={{ color: '#b8e0cc', marginBottom: '1.5rem', position: 'relative' }}>Use code <strong style={{ color: '#fff' }}>AQUA20</strong> at checkout</p>
            <BtnTeal onClick={() => router.push('/shop')} style={{ background: '#fff', color: 'var(--teal-dk)', position: 'relative' }}>Shop Now & Save</BtnTeal>
          </div>
        </div>
      </section>
    </div>
  );
}
