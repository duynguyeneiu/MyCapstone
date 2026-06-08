'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const router = useRouter();
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const [q, setQ] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const doSearch = () => {
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    router.push('/');
  };

  const initials = user
    ? user.name.split(' ').map((w: string) => w[0]).slice(-2).join('').toUpperCase()
    : 'JD';

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
            <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '20px' }}>storefront</span>
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
            <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '16px' }}>search</span>
          </button>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 4 }}>
          {([
            ['Shop',      '/shop',   'shopping_bag' ],
            ['My Orders', '/orders', 'receipt_long' ],
          ] as const).map(([label, href, icon]) => (
            <button
              key={label}
              onClick={() => router.push(href)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '.4rem 0.75rem', borderRadius: 9999, fontSize: '.875rem', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--teal-dk)', whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif" }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--teal-xs)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Cart + User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>

          {/* Not logged in → Login / Register buttons */}
          {!user && (
            <>
              <button
                onClick={() => router.push('/login')}
                style={{ padding: '.45rem 1.1rem', borderRadius: 9999, fontSize: '.875rem', fontWeight: 600, background: 'none', border: '1.5px solid var(--teal)', color: 'var(--teal)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--teal-xs)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
              >
                Login
              </button>
              <button
                onClick={() => router.push('/register')}
                style={{ padding: '.45rem 1.1rem', borderRadius: 9999, fontSize: '.875rem', fontWeight: 600, background: 'var(--teal)', border: 'none', color: '#fff', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--teal-dk)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--teal)'; }}
              >
                Register
              </button>
            </>
          )}

          {/* Cart (logged in) */}
          {user && (
            <button
              onClick={() => router.push('/cart')}
              style={{ position: 'relative', padding: '0.45rem', borderRadius: '0.6rem', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--teal-xs)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
              title="Cart"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--teal-dk)' }}>shopping_bag</span>
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: 0, right: 0, width: 17, height: 17, borderRadius: '50%', background: 'var(--teal)', color: '#fff', fontSize: '.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* User avatar + dropdown (logged in) */}
          {user && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowDropdown(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '5px 10px 5px 5px',
                  borderRadius: 9999,
                  background: 'var(--teal-xs)',
                  border: '1.5px solid var(--teal-lt)',
                  cursor: 'pointer',
                  transition: '.15s',
                }}
                title={user?.name}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'linear-gradient(135deg,var(--teal),var(--teal-dk))',
                  color: '#fff', fontWeight: 700, fontSize: '.75rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {initials}
                </div>
                <span style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--teal-dk)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name.split(' ')[0] ?? 'Guest'}
                </span>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--teal)', marginLeft: -2 }}>expand_more</span>
              </button>

              {/* Dropdown */}
              {showDropdown && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                  background: '#fff', borderRadius: '0.75rem', padding: '0.5rem',
                  boxShadow: '0 8px 24px rgba(0,0,0,.12)',
                  border: '1px solid #e2e8f0',
                  minWidth: 190, zIndex: 200,
                  animation: 'fadeUp .15s ease',
                }}>
                  {/* User info */}
                  <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #f1f5f9', marginBottom: '0.25rem' }}>
                    <p style={{ fontWeight: 600, fontSize: '.875rem', color: '#1e293b' }}>{user?.name}</p>
                    <p style={{ fontSize: '.75rem', color: '#94a3b8' }}>{user?.email}</p>
                    <span style={{ display: 'inline-block', marginTop: 4, background: 'var(--teal-lt)', color: 'var(--teal-dk)', borderRadius: 99, padding: '1px 8px', fontSize: '0.7rem', fontWeight: 700 }}>
                      {user?.role}
                    </span>
                  </div>

                  <button onClick={() => { setShowDropdown(false); router.push('/profile'); }}
                    style={menuItemStyle}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--teal-xs)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span className="material-symbols-outlined" style={menuIconStyle}>person</span>
                    My Profile
                  </button>
                  <button onClick={() => { setShowDropdown(false); router.push('/orders'); }}
                    style={menuItemStyle}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--teal-xs)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span className="material-symbols-outlined" style={menuIconStyle}>receipt_long</span>
                    My Orders
                  </button>
                  <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '0.25rem 0' }} />
                  <button onClick={handleLogout}
                    style={{ ...menuItemStyle, color: '#ef4444' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fff1f2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span className="material-symbols-outlined" style={{ ...menuIconStyle, color: '#ef4444' }}>logout</span>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Close dropdown on outside click */}
      {showDropdown && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 199 }} onClick={() => setShowDropdown(false)} />
      )}
    </nav>
  );
}

const menuItemStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8,
  width: '100%', padding: '0.5rem 0.75rem',
  background: 'transparent', border: 'none', cursor: 'pointer',
  fontSize: '.8rem', fontWeight: 500, color: '#374151',
  borderRadius: '0.5rem', textAlign: 'left', transition: '.1s',
  fontFamily: "'DM Sans', sans-serif",
};

const menuIconStyle: React.CSSProperties = {
  fontSize: '18px',
  color: 'var(--teal)',
};
