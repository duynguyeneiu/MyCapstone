'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PRODUCTS } from '../../lib/data';
import { Category, Subcategory, SortMode } from '../../lib/types';
import ProductCard from '../ui/ProductCard';

interface ShopContentProps {
  initCategory?: Category | 'all';
}

const CATEGORY_META: Record<string, { label: string; subcategories: { key: Subcategory; label: string }[] }> = {
  beverages: {
    label: 'Beverages',
    subcategories: [
      { key: 'water-soft-drinks', label: 'Water & Soft Drinks' },
      { key: 'tea-coffee',        label: 'Tea & Coffee' },
    ],
  },
  snacks: {
    label: 'Snacks & Confectionery',
    subcategories: [
      { key: 'chips-snacks', label: 'Chips & Snacks' },
      { key: 'sweets',       label: 'Sweets' },
    ],
  },
  food: {
    label: 'Food',
    subcategories: [
      { key: 'instant-foods', label: 'Instant Foods' },
      { key: 'ready-canned',  label: 'Ready & Canned Foods' },
    ],
  },
  'personal-care': {
    label: 'Personal Care',
    subcategories: [
      { key: 'oral-hair-care', label: 'Oral & Hair Care' },
      { key: 'body-skin-care', label: 'Body & Skin Care' },
    ],
  },
  household: {
    label: 'Household Essentials',
    subcategories: [
      { key: 'laundry-cleaning', label: 'Laundry & Cleaning' },
      { key: 'paper-storage',    label: 'Paper & Storage' },
    ],
  },
};

export default function ShopContent({ initCategory = 'all' }: ShopContentProps) {
  const router = useRouter();
  const [category, setCategory] = useState<Category | 'all'>(initCategory);
  const [subcategory, setSubcategory] = useState<Subcategory | 'all'>('all');
  const [maxPrice, setMaxPrice] = useState(50);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<SortMode>('default');

  const handleCategoryChange = (c: Category | 'all') => {
    setCategory(c);
    setSubcategory('all');
    router.push(c === 'all' ? '/shop' : `/shop?category=${c}`);
  };

  const subs = category !== 'all' ? CATEGORY_META[category]?.subcategories ?? [] : [];

  const filtered = PRODUCTS.filter(p =>
    (category === 'all' || p.category === category) &&
    (subcategory === 'all' || p.subcategory === subcategory) &&
    p.price <= maxPrice && p.rating >= minRating
  ).sort((a, b) =>
    sort === 'price-asc'  ? a.price - b.price
    : sort === 'price-desc' ? b.price - a.price
    : sort === 'rating'     ? b.rating - a.rating
    : 0
  );

  const heading =
    category === 'all'
      ? 'All Products'
      : subcategory !== 'all'
        ? subs.find(s => s.key === subcategory)?.label ?? CATEGORY_META[category]?.label
        : CATEGORY_META[category]?.label ?? 'All Products';

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>

        {/* ── Sidebar ── */}
        <aside style={{ width: 240, flexShrink: 0 }}>
          <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1.25rem', boxShadow: '0 2px 12px rgba(0,0,0,.05)', position: 'sticky', top: 76 }}>
            <h3 className="serif" style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem' }}>Filters</h3>

            {/* Category */}
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontWeight: 600, fontSize: '.875rem', color: '#374151', marginBottom: '0.5rem' }}>Category</p>
              {(['all', 'beverages', 'snacks', 'food', 'personal-care', 'household'] as const).map(c => (
                <label key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 6 }}>
                  <input
                    type="radio"
                    name="cat"
                    checked={category === c}
                    onChange={() => handleCategoryChange(c)}
                    style={{ accentColor: 'var(--teal)', width: 16, height: 16 }}
                  />
                  <span style={{ fontSize: '.875rem' }}>
                    {c === 'all' ? 'All' : CATEGORY_META[c]?.label}
                  </span>
                </label>
              ))}
            </div>

            {/* Subcategory — visible only when a specific category is active */}
            {subs.length > 0 && (
              <div style={{ marginBottom: '1.5rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                <p style={{ fontWeight: 600, fontSize: '.875rem', color: '#374151', marginBottom: '0.5rem' }}>Subcategory</p>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 6 }}>
                  <input
                    type="radio"
                    name="sub"
                    checked={subcategory === 'all'}
                    onChange={() => setSubcategory('all')}
                    style={{ accentColor: 'var(--teal)', width: 16, height: 16 }}
                  />
                  <span style={{ fontSize: '.875rem' }}>All</span>
                </label>
                {subs.map(s => (
                  <label key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 6 }}>
                    <input
                      type="radio"
                      name="sub"
                      checked={subcategory === s.key}
                      onChange={() => setSubcategory(s.key)}
                      style={{ accentColor: 'var(--teal)', width: 16, height: 16 }}
                    />
                    <span style={{ fontSize: '.875rem' }}>{s.label}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Max Price */}
            <div style={{ marginBottom: '1.5rem', paddingTop: subs.length === 0 ? 0 : undefined, borderTop: subs.length === 0 ? undefined : undefined }}>
              <p style={{ fontWeight: 600, fontSize: '.875rem', color: '#374151', marginBottom: '0.5rem' }}>
                Max Price: <span style={{ color: 'var(--teal)', fontWeight: 700 }}>${maxPrice}</span>
              </p>
              <input type="range" min={5} max={50} value={maxPrice} onChange={e => setMaxPrice(+e.target.value)} />
            </div>

            {/* Min Rating */}
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

            {/* Sort By */}
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

        {/* ── Product Grid ── */}
        <main style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 className="serif" style={{ fontSize: '1.5rem', fontWeight: 700 }}>{heading}</h2>
            <span style={{ color: '#64748b', fontSize: '.875rem' }}>
              {filtered.length} product{filtered.length !== 1 ? 's' : ''}
            </span>
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
