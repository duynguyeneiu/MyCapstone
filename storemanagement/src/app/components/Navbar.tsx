'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const router = useRouter();
  const { cartCount } = useCart();
  const [q, setQ] = useState('');

  const doSearch = () => {
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <nav style={{
      background: '#fff',
      borderBottom: '1px solid #e2e8f0',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0.75rem 1.5rem',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>

        {/* Logo */}
        <button
          onClick={() => router.push('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', marginRight: 8, flexShrink: 0 }}
        >
          <div style={{ width: 36, height: 36, borderRadius: '0.7rem', background: 'var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="#fff" />
            </svg>
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--teal)', fontFamily: "'Playfair Display', serif" }}>
            Happy Market
          </span>
        </button>

        {/* Search bar */}
        <div style={{ flex: 1, maxWidth: 480, position: 'relative', display: 'flex' }}>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
            placeholder="Search products, brands…"
            style={{
              borderRadius: 9999,
              fontSize: '.875rem',
              border: '1.5px solid var(--amber-border)',
              padding: '.55rem 2.5rem .55rem 1rem',
              width: '100%',
              outline: 'none',
              background: '#fff8e6',
              fontFamily: "'DM Sans', sans-serif",
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--amber)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(245,158,11,.18)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--amber-border)'; e.currentTarget.style.boxShadow = 'none'; }}
          />
          <button
            onClick={doSearch}
            style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', width: 32, height: 32, borderRadius: '50%', background: 'var(--teal)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
              <path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4 }}>
          {([['Shop', '/shop'], ['My Orders', '/orders']] as const).map(([label, href]) => (
            <button
              key={label}
              onClick={() => router.push(href)}
              style={{ padding: '.4rem 0.75rem', borderRadius: 9999, fontSize: '.875rem', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--teal-dk)', whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif" }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--teal-xs)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Cart + Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          <button
            onClick={() => router.push('/cart')}
            style={{ position: 'relative', padding: '0.5rem', borderRadius: '50%', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--teal-xs)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
          >
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="currentColor" strokeWidth="1.8" />
              <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="1.8" />
              <path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="1.8" />
            </svg>
            {cartCount > 0 && (
              <span style={{ position: 'absolute', top: -2, right: -2, width: 18, height: 18, borderRadius: '50%', background: 'var(--teal)', color: '#fff', fontSize: '.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => router.push('/profile')}
            style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,var(--teal),var(--teal-dk))', color: '#fff', fontWeight: 700, fontSize: '.875rem', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
            title="My Profile"
          >
            JD
          </button>
        </div>
      </div>
    </nav>
  );
}
