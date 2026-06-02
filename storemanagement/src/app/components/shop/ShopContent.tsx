'use client';

import React, { useState } from 'react';
import { PRODUCTS } from '../../lib/data';
import { Category, SortMode } from '../../lib/types';
import ProductCard from '../ui/ProductCard';

interface ShopContentProps {
  initCategory?: Category | 'all';
}

export default function ShopContent({ initCategory = 'all' }: ShopContentProps) {
  const [category, setCategory] = useState<Category | 'all'>(initCategory);
  const [maxPrice, setMaxPrice] = useState(200);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<SortMode>('default');

  const filtered = PRODUCTS.filter(p =>
    (category === 'all' || p.category === category) &&
    p.price <= maxPrice && p.rating >= minRating
  ).sort((a, b) =>
    sort === 'price-asc' ? a.price - b.price
    : sort === 'price-desc' ? b.price - a.price
    : sort === 'rating' ? b.rating - a.rating
    : 0
  );

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        {/* Sidebar */}
        <aside style={{ width: 240, flexShrink: 0 }}>
          <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1.25rem', boxShadow: '0 2px 12px rgba(0,0,0,.05)', position: 'sticky', top: 76 }}>
            <h3 className="serif" style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem' }}>Filters</h3>

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontWeight: 600, fontSize: '.875rem', color: '#374151', marginBottom: '0.5rem' }}>Category</p>
              {(['all', 'appliances', 'food', 'beauty'] as const).map(c => (
                <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 6 }}>
                  <input type="radio" name="cat" checked={category === c} onChange={() => setCategory(c)} style={{ accentColor: 'var(--teal)', width: 16, height: 16 }} />
                  <span style={{ fontSize: '.875rem' }}>
                    {c === 'all' ? 'All' : c === 'appliances' ? 'Home Appliances' : c === 'food' ? 'Food & Drinks' : 'Beauty & Cosmetics'}
                  </span>
                </label>
              ))}
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontWeight: 600, fontSize: '.875rem', color: '#374151', marginBottom: '0.5rem' }}>
                Max Price: <span style={{ color: 'var(--teal)', fontWeight: 700 }}>${maxPrice}</span>
              </p>
              <input type="range" min={5} max={200} value={maxPrice} onChange={e => setMaxPrice(+e.target.value)} />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <p style={{ fontWeight: 600, fontSize: '.875rem', color: '#374151', marginBottom: '0.5rem' }}>Min Rating</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {([0, 4, 4.5] as const).map(r => (
                  <button key={r} onClick={() => setMinRating(r)}
                    style={{ padding: '.3rem .75rem', borderRadius: 9999, border: '1.5px solid', borderColor: minRating === r ? 'var(--teal)' : '#e2e8f0', background: minRating === r ? 'var(--teal-xs)' : '#fff', color: minRating === r ? 'var(--teal-dk)' : '#64748b', fontSize: '.75rem', fontWeight: 500, cursor: 'pointer' }}>
                    {r === 0 ? 'All' : `${r}+ ★`}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p style={{ fontWeight: 600, fontSize: '.875rem', color: '#374151', marginBottom: '0.5rem' }}>Sort By</p>
              <select value={sort} onChange={e => setSort(e.target.value as SortMode)} style={{ fontSize: '.875rem' }}>
                <option value="default">Default</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="rating">Best Rated</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Grid */}
        <main style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 className="serif" style={{ fontSize: '1.5rem', fontWeight: 700 }}>
              {category === 'all' ? 'All Products' : category === 'appliances' ? 'Home Appliances' : category === 'food' ? 'Food & Drinks' : 'Beauty & Cosmetics'}
            </h2>
            <span style={{ color: '#64748b', fontSize: '.875rem' }}>{filtered.length} product{filtered.length !== 1 ? 's' : ''}</span>
          </div>
          {filtered.length === 0
            ? <p style={{ color: '#94a3b8', textAlign: 'center', padding: '4rem' }}>No products match your filters.</p>
            : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '1.25rem' }}>
                {filtered.map(p => <ProductCard key={p.id} p={p} />)}
              </div>
            )}
        </main>
      </div>
    </div>
  );
}
