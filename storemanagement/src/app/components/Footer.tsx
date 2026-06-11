'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const shopLinks: [string, string][] = [
  ['Home Appliances', '/shop?category=appliances'],
  ['Food & Drinks',   '/shop?category=food'],
  ['Beauty',          '/shop?category=beauty'],
];

export default function Footer() {
  const router = useRouter();

  return (
    <footer
      style={{
        background: '#0f172a',
        color: '#94a3b8',
        padding: '2.5rem 1.5rem',
        fontSize: '.875rem',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'space-between' }}>

        {/* Brand */}
        <div>
          <span
            style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 700, fontFamily: "'Playfair Display', serif", cursor: 'pointer' }}
            onClick={() => router.push('/')}
          >
            Happy Market
          </span>
          <p style={{ marginTop: 6, maxWidth: 240, lineHeight: 1.6 }}>
            Fresh finds delivered daily. Home appliances, gourmet food & beauty products.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: '1rem' }}>
            {['bi-twitter', 'bi-facebook', 'bi-youtube', 'bi-linkedin'].map(icon => (
              <a key={icon} href="#"
                style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', textDecoration: 'none', transition: '.2s' }}
                onMouseEnter={e => { (e.currentTarget).style.borderColor = 'var(--teal)'; (e.currentTarget).style.color = 'var(--teal-lt)'; }}
                onMouseLeave={e => { (e.currentTarget).style.borderColor = '#334155'; (e.currentTarget).style.color = '#94a3b8'; }}>
                <i className={`bi ${icon}`} style={{ fontSize: '0.9rem' }} />
              </a>
            ))}
          </div>
        </div>

        {/* Nav columns */}
        <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
          {/* Shop */}
          <div>
            <p style={{ color: '#fff', fontWeight: 600, marginBottom: 12, fontSize: '1rem' }}>Shop</p>
            {shopLinks.map(([label, href]) => (
              <p key={label}
                style={{ cursor: 'pointer', marginTop: 8, transition: '.15s' }}
                onClick={() => router.push(href)}
                onMouseEnter={e => ((e.target as HTMLElement).style.color = '#5eead4')}
                onMouseLeave={e => ((e.target as HTMLElement).style.color = '#94a3b8')}
              >
                {label}
              </p>
            ))}
          </div>

          {/* Help */}
          <div>
            <p style={{ color: '#fff', fontWeight: 600, marginBottom: 12, fontSize: '1rem' }}>Help</p>
            {['FAQ', 'Returns', 'Contact'].map(l => (
              <p key={l}
                style={{ cursor: 'pointer', marginTop: 8, transition: '.15s' }}
                onMouseEnter={e => ((e.target as HTMLElement).style.color = '#5eead4')}
                onMouseLeave={e => ((e.target as HTMLElement).style.color = '#94a3b8')}
              >
                {l}
              </p>
            ))}
          </div>

          {/* Account */}
          <div>
            <p style={{ color: '#fff', fontWeight: 600, marginBottom: 12, fontSize: '1rem' }}>Account</p>
            {([['My Profile', '/profile'], ['Order History', '/orders'], ['My Reviews', '/reviews'], ['Shopping Cart', '/cart']] as [string, string][]).map(([label, href]) => (
              <p key={label}
                style={{ cursor: 'pointer', marginTop: 8, transition: '.15s' }}
                onClick={() => router.push(href)}
                onMouseEnter={e => ((e.target as HTMLElement).style.color = '#5eead4')}
                onMouseLeave={e => ((e.target as HTMLElement).style.color = '#94a3b8')}
              >
                {label}
              </p>
            ))}
          </div>
        </div>

        {/* Contact + Newsletter */}
        <div id="footer-contact">
          <p style={{ color: '#fff', fontWeight: 600, marginBottom: 12, fontSize: '1rem' }}>Contact</p>
          {[
            ['location_on', 'Ho Chi Minh City, Vietnam'],
            ['email',       'hello@aquamarket.vn'],
            ['phone',       '+84 912 345 678'],
          ].map(([icon, text]) => (
            <p key={text} style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--teal-lt)', flexShrink: 0 }}>{icon}</span>
              {text}
            </p>
          ))}

          <p style={{ color: '#fff', fontWeight: 500, marginBottom: 8, fontSize: '.875rem', marginTop: '1.25rem' }}>
            Subscribe for deals
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              type="email"
              placeholder="Your email"
              style={{ flex: 1, padding: '.5rem .85rem', borderRadius: 9999, border: '1px solid #334155', background: '#1e293b', color: '#fff', fontSize: '.8rem', outline: 'none', fontFamily: "'DM Sans', sans-serif", minWidth: 0 }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--teal)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = '#334155'; }}
            />
            <button
              style={{ padding: '.5rem 1rem', borderRadius: 9999, background: 'var(--teal)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '.8rem', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--teal-dk)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--teal)'; }}
            >
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ maxWidth: 1280, margin: '1.5rem auto 0', paddingTop: '1.5rem', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <p style={{ fontSize: '.75rem', color: '#475569' }}>© 2025 Happy Market. All rights reserved.</p>
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '.75rem' }}>
          {['Privacy Policy', 'Terms of Use', 'Sales & Refunds'].map(l => (
            <span key={l}
              style={{ cursor: 'pointer', transition: '.15s' }}
              onMouseEnter={e => ((e.target as HTMLElement).style.color = '#5eead4')}
              onMouseLeave={e => ((e.target as HTMLElement).style.color = '#475569')}
            >
              {l}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
