'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { categoryService } from '@/src/services/categoryService';
import { Category } from '@/src/lib/data';
import { CATEGORY_META, DEFAULT_CATEGORY_META } from '@/src/lib/categoryMeta';

export default function CategoryBar() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [hoveredCat, setHoveredCat] = useState<number | null>(null);

  useEffect(() => {
    categoryService.getAll().then(setCategories).catch(err => console.error(err));
  }, []);

  const topCategories = categories.filter(c => c.parentCategoryId == null);

  return (
    <div style={{
      background: '#fff',
      borderBottom: '1.5px solid var(--amber-border)',
      padding: '0.5rem 1.5rem',
      position: 'relative',
      zIndex: 40,
    }}>
      <div style={{ display: 'flex', gap: '0.5rem', maxWidth: 1280, margin: '0 auto' }}>
        {/* All Products — always present, not tied to any category id */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => router.push('/shop')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '.3rem .85rem', borderRadius: 9999,
              border: '1.5px solid var(--amber-border)',
              fontSize: '.8rem', fontWeight: 500,
              background: 'var(--amber-xs)',
              color: 'var(--amber-dk)',
              cursor: 'pointer', whiteSpace: 'nowrap', transition: '.2s',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>apps</span>
            All Products
          </button>
        </div>

        {topCategories.map(c => {
          const meta = CATEGORY_META[c.name] ?? DEFAULT_CATEGORY_META;
          const subs = categories.filter(s => s.parentCategoryId === c.id);
          const isHovered = hoveredCat === c.id;

          return (
            <div
              key={c.id}
              style={{ position: 'relative' }}
              onMouseEnter={() => { if (subs.length > 0) setHoveredCat(c.id); }}
              onMouseLeave={() => setHoveredCat(null)}
            >
              <button
                onClick={() => router.push(`/shop?category=${c.id}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '.3rem .85rem', borderRadius: 9999,
                  border: `1.5px solid ${isHovered ? 'var(--teal)' : 'var(--amber-border)'}`,
                  fontSize: '.8rem', fontWeight: 500,
                  background: isHovered ? 'var(--teal)' : 'var(--amber-xs)',
                  color: isHovered ? '#fff' : 'var(--amber-dk)',
                  cursor: 'pointer', whiteSpace: 'nowrap', transition: '.2s',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{meta.icon}</span>
                {c.name}
                {subs.length > 0 && (
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', marginLeft: -2, transition: '.2s' }}>
                    {isHovered ? 'expand_less' : 'expand_more'}
                  </span>
                )}
              </button>

              {/* Dropdown — outer div sits flush with wrapper bottom so hover bridge is seamless */}
              {isHovered && subs.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 100, minWidth: 200 }}>
                  <div style={{
                    marginTop: 6,
                    background: '#fff',
                    borderRadius: '0.75rem',
                    boxShadow: '0 8px 24px rgba(0,0,0,.12)',
                    border: '1px solid #e2e8f0',
                    padding: '0.4rem',
                    animation: 'fadeUp .15s ease',
                  }}>
                    {subs.map(s => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setHoveredCat(null);
                          router.push(`/shop?category=${c.id}&sub=${s.id}`);
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          width: '100%', padding: '0.5rem 0.75rem',
                          background: 'transparent', border: 'none',
                          cursor: 'pointer', fontSize: '.825rem',
                          fontWeight: 500, color: '#374151',
                          borderRadius: '0.5rem', textAlign: 'left',
                          transition: '.12s',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'var(--teal-xs)';
                          e.currentTarget.style.color = 'var(--teal-dk)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#374151';
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--teal)' }}>chevron_right</span>
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
