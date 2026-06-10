'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '../../lib/types';
import { fmt, disc } from '../../lib/utils';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Badge from './Badge';
import StarRow from './StarRow';

interface ProductCardProps {
  p: Product;
}

export default function ProductCard({ p }: ProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const d = disc(p);

  return (
    <div
      onClick={() => router.push(`/product/${p.id}`)}
      style={{ background: '#fff', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.06)', cursor: 'pointer', transition: 'all .25s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 30px rgba(0,105,76,.18)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,.06)'; }}
    >
      <div style={{ background: 'var(--teal-xs)', height: 160, position: 'relative', overflow: 'hidden' }}>
        <img
          src={p.image}
          alt={p.name}
          style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '0.5rem' }}
        />
        {d > 0 && (
          <span style={{ position: 'absolute', top: 8, right: 8, background: '#fef9c3', color: '#854d0e', borderRadius: 9999, padding: '.15rem .6rem', fontSize: '.72rem', fontWeight: 600 }}>
            -{d}%
          </span>
        )}
      </div>
      <div style={{ padding: '1rem' }}>
        <Badge>{p.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</Badge>
        <p style={{ fontWeight: 600, fontSize: '.875rem', lineHeight: 1.4, margin: '.3rem 0 .25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {p.name}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
          <StarRow rating={p.rating} size="text-xs" />
          <span style={{ fontSize: '.75rem', color: '#94a3b8' }}>({p.reviews})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: '.875rem', color: 'var(--teal)' }}>{fmt(p.price)}</span>
            {p.original && (
              <span style={{ textDecoration: 'line-through', fontSize: '.75rem', color: '#94a3b8', marginLeft: 4 }}>{fmt(p.original)}</span>
            )}
          </div>
          <button
            onClick={e => {
              e.stopPropagation();
              if (!user) { router.push('/login'); return; }
              addToCart(p.id);
            }}
            style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--teal)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
