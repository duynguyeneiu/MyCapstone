'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type CatKey = 'all' | 'beverages' | 'snacks' | 'food' | 'personal-care' | 'household';

const CATS: { key: CatKey; label: string; icon: string }[] = [
  { key: 'all',           label: 'All Products',           icon: 'apps'             },
  { key: 'beverages',     label: 'Beverages',              icon: 'local_drink'      },
  { key: 'snacks',        label: 'Snacks & Confectionery', icon: 'cookie'           },
  { key: 'food',          label: 'Food',                   icon: 'lunch_dining'     },
  { key: 'personal-care', label: 'Personal Care',          icon: 'self_care'        },
  { key: 'household',     label: 'Household Essentials',   icon: 'cleaning_services'},
];

const SUBCATS: Partial<Record<CatKey, { key: string; label: string }[]>> = {
  beverages:       [{ key: 'water-soft-drinks', label: 'Water & Soft Drinks' }, { key: 'tea-coffee',     label: 'Tea & Coffee'         }],
  snacks:          [{ key: 'chips-snacks',      label: 'Chips & Snacks'      }, { key: 'sweets',         label: 'Sweets'               }],
  food:            [{ key: 'instant-foods',     label: 'Instant Foods'       }, { key: 'ready-canned',   label: 'Ready & Canned Foods' }],
  'personal-care': [{ key: 'oral-hair-care',    label: 'Oral & Hair Care'    }, { key: 'body-skin-care', label: 'Body & Skin Care'     }],
  household:       [{ key: 'laundry-cleaning',  label: 'Laundry & Cleaning'  }, { key: 'paper-storage',  label: 'Paper & Storage'      }],
};

export default function CategoryBar() {
  const router = useRouter();
  const [hoveredCat, setHoveredCat] = useState<CatKey | null>(null);

  return (
    <div style={{
      background: '#fff',
      borderBottom: '1.5px solid var(--amber-border)',
      padding: '0.5rem 1.5rem',
      position: 'relative',
      zIndex: 40,
    }}>
      <div style={{ display: 'flex', gap: '0.5rem', maxWidth: 1280, margin: '0 auto' }}>
        {CATS.map(({ key, label, icon }) => {
          const subs = SUBCATS[key] ?? [];
          const isHovered = hoveredCat === key;

          return (
            <div
              key={key}
              style={{ position: 'relative' }}
              onMouseEnter={() => { if (subs.length > 0) setHoveredCat(key); }}
              onMouseLeave={() => setHoveredCat(null)}
            >
              <button
                onClick={() => router.push(key === 'all' ? '/shop' : `/shop?category=${key}`)}
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
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{icon}</span>
                {label}
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
                        key={s.key}
                        onClick={() => {
                          setHoveredCat(null);
                          router.push(`/shop?category=${key}&sub=${s.key}`);
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
                        {s.label}
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
