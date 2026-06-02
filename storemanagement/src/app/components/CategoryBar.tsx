'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const cats = [
  ['all',        'All Products'],
  ['appliances', '🏠 Appliances'],
  ['food',       '🍱 Food & Drinks'],
  ['beauty',     '💄 Beauty'],
] as const;

export default function CategoryBar() {
  const router = useRouter();
  return (
    <div style={{ background: '#fff', borderBottom: '1.5px solid var(--amber-border)', padding: '0.5rem 1.5rem', overflowX: 'auto' }}>
      <div style={{ display: 'flex', gap: '0.5rem', maxWidth: 1280, margin: '0 auto' }}>
        {cats.map(([c, l]) => (
          <button
            key={c}
            onClick={() => router.push(c === 'all' ? '/shop' : `/shop?category=${c}`)}
            style={{ padding: '.3rem .85rem', borderRadius: 9999, border: '1.5px solid var(--amber-border)', fontSize: '.8rem', fontWeight: 500, background: 'var(--amber-xs)', cursor: 'pointer', whiteSpace: 'nowrap', transition: '.2s', color: 'var(--amber-dk)' }}
            onMouseEnter={e => { const b = e.currentTarget; b.style.background = 'var(--teal)'; b.style.borderColor = 'var(--teal)'; b.style.color = '#fff'; }}
            onMouseLeave={e => { const b = e.currentTarget; b.style.background = 'var(--amber-xs)'; b.style.borderColor = 'var(--amber-border)'; b.style.color = 'var(--amber-dk)'; }}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}
