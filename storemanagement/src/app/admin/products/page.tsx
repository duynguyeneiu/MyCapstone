'use client'
import { useState } from 'react'
import Link from 'next/link'
import { PRODUCTS } from '../../lib/data'

const PAGE_SIZE = 10

const CAT_LABELS: Record<string, string> = {
  beverages:       'Beverages',
  snacks:          'Snacks & Confectionery',
  food:            'Food',
  'personal-care': 'Personal Care',
  household:       'Household Essentials',
}

const SUB_LABELS: Record<string, string> = {
  'water-soft-drinks': 'Water & Soft Drinks',
  'tea-coffee':        'Tea & Coffee',
  'chips-snacks':      'Chips & Snacks',
  'sweets':            'Sweets',
  'instant-foods':     'Instant Foods',
  'ready-canned':      'Ready & Canned Foods',
  'oral-hair-care':    'Oral & Hair Care',
  'body-skin-care':    'Body & Skin Care',
  'laundry-cleaning':  'Laundry & Cleaning',
  'paper-storage':     'Paper & Storage',
}

const CAT_COLORS: Record<string, { bg: string; color: string }> = {
  beverages:       { bg: '#e0f5ed', color: '#004d38' },
  snacks:          { bg: '#fff3d6', color: '#7a5c00' },
  food:            { bg: '#fef3c7', color: '#92400e' },
  'personal-care': { bg: '#ede9fe', color: '#4c1d95' },
  household:       { bg: '#e0f2fe', color: '#075985' },
}

export default function ProductTablePage() {
  const [page, setPage] = useState(1)

  const totalPages = Math.ceil(PRODUCTS.length / PAGE_SIZE)
  const start      = (page - 1) * PAGE_SIZE
  const paged      = PRODUCTS.slice(start, start + PAGE_SIZE)

  const goTo = (p: number) => setPage(Math.max(1, Math.min(totalPages, p)))

  // Show at most 5 page buttons, centered around current page
  const pageNums: number[] = []
  const half = 2
  let lo = Math.max(1, page - half)
  let hi = Math.min(totalPages, page + half)
  if (hi - lo < 4) {
    if (lo === 1) hi = Math.min(totalPages, lo + 4)
    else          lo = Math.max(1, hi - 4)
  }
  for (let i = lo; i <= hi; i++) pageNums.push(i)

  return (
    <div style={{ padding: '2rem', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#00694c' }}>Products</h1>
        <Link href="/admin/products/create" style={{ background: 'linear-gradient(135deg,#00694c,#00a86b)', color: '#fff', padding: '0.5rem 1.25rem', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
          + Create new product
        </Link>
      </div>

      <div style={{ background: '#fff', borderRadius: '1rem', border: '1.5px solid #c8e4d8', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,105,76,.07)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', whiteSpace: 'nowrap', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ background: '#f4fbf7', borderBottom: '1.5px solid #c8e4d8' }}>
                <th style={th}>#</th>
                <th style={th}>Product</th>
                <th style={th}>Category</th>
                <th style={th}>Subcategory</th>
                <th style={th}>Price</th>
                <th style={th}>Original</th>
                <th style={th}>Rating</th>
                <th style={th}>Reviews</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((item, idx) => {
                const cc = CAT_COLORS[item.category] ?? { bg: '#e0f5ed', color: '#004d38' }
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #e8f4ee', background: idx % 2 === 0 ? '#fff' : '#fafcfb' }}>
                    <td style={td}>{item.id}</td>
                    <td style={td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '0.5rem', background: 'var(--teal-xs)', overflow: 'hidden', flexShrink: 0 }}>
                          <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>{item.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>P{String(item.id).padStart(3,'0')}</div>
                        </div>
                      </div>
                    </td>
                    <td style={td}>
                      <span style={{ background: cc.bg, color: cc.color, padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 600 }}>
                        {CAT_LABELS[item.category] ?? item.category}
                      </span>
                    </td>
                    <td style={{ ...td, color: '#64748b' }}>{SUB_LABELS[item.subcategory] ?? item.subcategory}</td>
                    <td style={{ ...td, fontWeight: 700, color: '#00694c' }}>${item.price.toFixed(2)}</td>
                    <td style={{ ...td, color: '#94a3b8', textDecoration: item.original ? 'line-through' : 'none' }}>
                      {item.original ? `$${item.original.toFixed(2)}` : '—'}
                    </td>
                    <td style={{ ...td, color: '#b47b10', fontWeight: 600 }}>★ {item.rating.toFixed(1)}</td>
                    <td style={td}>{item.reviews}</td>
                    <td style={td}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link href={`/admin/products/${item.id}/edit`} style={{ padding: '4px 12px', borderRadius: '6px', background: '#fff3d6', color: '#7a5c00', textDecoration: 'none', fontSize: '12px', fontWeight: 600, border: '1px solid #fcd97a' }}>
                          Edit
                        </Link>
                        <Link href={`/admin/products/${item.id}/delete`} style={{ padding: '4px 12px', borderRadius: '6px', background: '#fee2e2', color: '#991b1b', textDecoration: 'none', fontSize: '12px', fontWeight: 600, border: '1px solid #fca5a5' }}>
                          Delete
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div style={{ padding: '0.75rem 1.5rem', borderTop: '1px solid #c8e4d8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
            Showing {start + 1}–{Math.min(start + PAGE_SIZE, PRODUCTS.length)} of {PRODUCTS.length} products
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {/* Prev */}
            <button
              onClick={() => goTo(page - 1)}
              disabled={page === 1}
              style={{ ...pgBtn, opacity: page === 1 ? 0.35 : 1 }}
            >
              ‹
            </button>

            {/* First page shortcut */}
            {lo > 1 && (
              <>
                <button onClick={() => goTo(1)} style={pgBtn}>1</button>
                {lo > 2 && <span style={{ fontSize: '0.8125rem', color: '#94a3b8', padding: '0 2px' }}>…</span>}
              </>
            )}

            {/* Page number buttons */}
            {pageNums.map(n => (
              <button
                key={n}
                onClick={() => goTo(n)}
                style={{
                  ...pgBtn,
                  background:   n === page ? '#00694c' : pgBtn.background,
                  color:        n === page ? '#fff'    : pgBtn.color,
                  borderColor:  n === page ? '#00694c' : pgBtn.borderColor,
                  fontWeight:   n === page ? 700       : 500,
                }}
              >
                {n}
              </button>
            ))}

            {/* Last page shortcut */}
            {hi < totalPages && (
              <>
                {hi < totalPages - 1 && <span style={{ fontSize: '0.8125rem', color: '#94a3b8', padding: '0 2px' }}>…</span>}
                <button onClick={() => goTo(totalPages)} style={pgBtn}>{totalPages}</button>
              </>
            )}

            {/* Next */}
            <button
              onClick={() => goTo(page + 1)}
              disabled={page === totalPages}
              style={{ ...pgBtn, opacity: page === totalPages ? 0.35 : 1 }}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const th: React.CSSProperties = {
  padding: '0.75rem 1rem',
  fontWeight: 600,
  fontSize: '0.75rem',
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  textAlign: 'left',
}

const td: React.CSSProperties = {
  padding: '0.75rem 1rem',
  verticalAlign: 'middle',
}

const pgBtn: React.CSSProperties = {
  minWidth: 32,
  height: 32,
  padding: '0 6px',
  borderRadius: '0.4rem',
  border: '1.5px solid #c8e4d8',
  background: '#fff',
  color: '#374151',
  fontSize: '0.8125rem',
  fontWeight: 500,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all .15s',
}
