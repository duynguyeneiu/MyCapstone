'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PRODUCTS } from '../../lib/data';
import BtnTeal from '../ui/BtnTeal';
import BtnOutline from '../ui/BtnOutline';
import ProductCard from '../ui/ProductCard';

export default function HomeContent() {
  const router = useRouter();
  const featured = [...PRODUCTS].sort((a, b) => b.rating - a.rating).slice(0, 8);
  const SHOW = 5; // cards visible at once
  const maxStep = featured.length - SHOW;
  const [featStep, setFeatStep] = useState(0);
  const [featPaused, setFeatPaused] = useState(false);

  useEffect(() => {
    if (featPaused) return;
    const id = setInterval(() => {
      setFeatStep(s => (s >= maxStep ? 0 : s + 1));
    }, 3000);
    return () => clearInterval(id);
  }, [featPaused, maxStep]);

  const ALL_CATS = [
    { key: 'beverages',     label: 'Beverages',              sub: 'Water, tea, coffee & soft drinks', icon: 'local_drink',       iconBg: '#e0f5ed', iconColor: '#00694c' },
    { key: 'snacks',        label: 'Snacks & Confectionery', sub: 'Chips, sweets & sweet treats',     icon: 'cookie',            iconBg: '#fff3d6', iconColor: '#b47b10' },
    { key: 'food',          label: 'Food',                   sub: 'Instant foods & canned goods',     icon: 'lunch_dining',      iconBg: '#fef3c7', iconColor: '#92400e' },
    { key: 'personal-care', label: 'Personal Care',          sub: 'Oral, hair & skin care',           icon: 'self_care',         iconBg: '#ede9fe', iconColor: '#4c1d95' },
    { key: 'household',     label: 'Household Essentials',   sub: 'Cleaning & storage supplies',      icon: 'cleaning_services', iconBg: '#e0f2fe', iconColor: '#075985' },
  ];
  const [catOffset, setCatOffset] = useState(0);

  const stats = [['500+', 'Products'], ['50K+', 'Customers'], ['4.9★', 'Avg Rating'], ['24h', 'Delivery']];

  return (
    <div>
      {/* Hero */}
      <section style={{ display: 'block', lineHeight: 0 }}>
        <Image
          src="/image/banner.jpg"
          alt="Happy Market – Fresh Finds Delivered Daily"
          width={1920}
          height={600}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          priority
        />
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
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
            <div>
              <h2 className="serif" style={{ fontSize: '2rem', fontWeight: 700 }}>Shop by Category</h2>
              <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Find exactly what you need</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setCatOffset(o => Math.max(0, o - 1))}
                disabled={catOffset === 0}
                style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid', borderColor: catOffset === 0 ? '#e2e8f0' : 'var(--teal)', background: catOffset === 0 ? '#f8fafc' : '#fff', color: catOffset === 0 ? '#cbd5e1' : 'var(--teal)', cursor: catOffset === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_left</span>
              </button>
              <button
                onClick={() => setCatOffset(o => Math.min(ALL_CATS.length - 3, o + 1))}
                disabled={catOffset >= ALL_CATS.length - 3}
                style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid', borderColor: catOffset >= ALL_CATS.length - 3 ? '#e2e8f0' : 'var(--teal)', background: catOffset >= ALL_CATS.length - 3 ? '#f8fafc' : '#fff', color: catOffset >= ALL_CATS.length - 3 ? '#cbd5e1' : 'var(--teal)', cursor: catOffset >= ALL_CATS.length - 3 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_right</span>
              </button>
            </div>
          </div>

          {/* Sliding track — overflow hidden clips cards outside the viewport */}
          <div style={{ overflow: 'hidden', margin: '0 -0.625rem', background: '#f8fafc' }}>
            <div style={{
              display: 'flex',
              width: `calc(500% / 3)`,
              transform: `translateX(calc(-${catOffset} * 20%))`,
              transition: 'transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94)',
              background: '#f8fafc',
            }}>
              {ALL_CATS.map(c => (
                <div key={c.key} style={{ width: '20%', padding: '0 0.625rem', boxSizing: 'border-box', background: '#f8fafc' }}>
                  <button
                    onClick={() => router.push(`/shop?category=${c.key}`)}
                    style={{ width: '100%', background: '#fff', borderRadius: '1.5rem', padding: '2rem', textAlign: 'left', border: '2px solid var(--teal)', cursor: 'pointer', transition: 'box-shadow .2s, transform .2s, border-color .2s', boxShadow: '0 4px 24px rgba(0,0,0,.08)' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,105,76,.25)'; e.currentTarget.style.borderColor = 'var(--teal-dk)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,.08)'; e.currentTarget.style.borderColor = 'var(--teal)'; }}
                  >
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: c.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '1.75rem', color: c.iconColor }}>{c.icon}</span>
                    </div>
                    <h3 className="serif" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.35rem' }}>{c.label}</h3>
                    <p style={{ color: '#64748b', fontSize: '.875rem' }}>{c.sub}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: '1rem', color: 'var(--teal)', fontSize: '.875rem', fontWeight: 500 }}>
                      <span>Shop now</span>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '1.5rem' }}>
            {[0, 1, 2].map(i => (
              <button
                key={i}
                onClick={() => setCatOffset(i)}
                style={{ width: catOffset === i ? 24 : 8, height: 8, borderRadius: 9999, background: catOffset === i ? 'var(--teal)' : '#cbd5e1', border: 'none', cursor: 'pointer', transition: 'all .2s', padding: 0 }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured — auto-play carousel */}
      <section
        style={{ padding: '3.5rem 1.5rem', background: '#fff' }}
        onMouseEnter={() => setFeatPaused(true)}
        onMouseLeave={() => setFeatPaused(false)}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div>
              <h2 className="serif" style={{ fontSize: '2rem', fontWeight: 700 }}>Featured Products</h2>
              <p style={{ color: '#64748b', marginTop: '0.25rem' }}>Handpicked just for you</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={() => setFeatStep(s => Math.max(0, s - 1))}
                disabled={featStep === 0}
                style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid', borderColor: featStep === 0 ? '#e2e8f0' : 'var(--teal)', background: featStep === 0 ? '#f8fafc' : '#fff', color: featStep === 0 ? '#cbd5e1' : 'var(--teal)', cursor: featStep === 0 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_left</span>
              </button>
              <button
                onClick={() => setFeatStep(s => Math.min(maxStep, s + 1))}
                disabled={featStep >= maxStep}
                style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid', borderColor: featStep >= maxStep ? '#e2e8f0' : 'var(--teal)', background: featStep >= maxStep ? '#f8fafc' : '#fff', color: featStep >= maxStep ? '#cbd5e1' : 'var(--teal)', cursor: featStep >= maxStep ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_right</span>
              </button>
              <BtnOutline onClick={() => router.push('/shop')}>View All</BtnOutline>
            </div>
          </div>

          {/* Sliding track */}
          <div style={{ overflow: 'hidden', margin: '0 -0.5rem', background: '#fff' }}>
            <div style={{
              display: 'flex',
              width: `calc(${featured.length} * 100% / ${SHOW})`,
              transform: `translateX(calc(-${featStep} * 100% / ${featured.length}))`,
              transition: 'transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)',
              background: '#fff',
            }}>
              {featured.map(p => (
                <div key={p.id} style={{ width: `calc(100% / ${featured.length})`, padding: '0 0.5rem', boxSizing: 'border-box', background: '#fff' }}>
                  <ProductCard p={p} />
                </div>
              ))}
            </div>
          </div>

          {/* Progress dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: '1.5rem' }}>
            {Array.from({ length: maxStep + 1 }, (_, i) => (
              <button
                key={i}
                onClick={() => setFeatStep(i)}
                style={{ width: featStep === i ? 24 : 8, height: 8, borderRadius: 9999, background: featStep === i ? 'var(--teal)' : '#cbd5e1', border: 'none', cursor: 'pointer', transition: 'all .2s', padding: 0 }}
              />
            ))}
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
