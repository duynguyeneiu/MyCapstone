'use client';

import React, { useState, useEffect } from 'react';
import { reviewService, ApiReview, unwrapComment, maskName } from '@/src/services/reviewService';

// ─── Mini star renderer ───────────────────────────────────────────────────────

function StarDisplay({ n, size = 14 }: { n: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ fontSize: size, color: i <= n ? '#f59e0b' : '#e2e8f0', lineHeight: 1 }}>★</span>
      ))}
    </span>
  );
}

const AVATAR_COLORS = ['#00694c', '#1d6fb8', '#b47b10', '#7c3aed', '#be185d', '#0369a1', '#166534', '#92400e'];

function formatDate(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props { productId: number; }

const PAGE_SIZE = 5;

export default function ReviewSection({ productId }: Props) {
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStar, setFilterStar] = useState<number | null>(null);
  const [curPage, setCurPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    reviewService
      .getByProduct(productId)
      .then(setReviews)
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [productId]);

  const reviewCount = reviews.length;
  const avgRating = reviewCount ? reviews.reduce((s, r) => s + r.rating, 0) / reviewCount : 0;
  const counts: [number, number, number, number, number] = [1, 2, 3, 4, 5].map(
    star => reviews.filter(r => r.rating === star).length
  ) as [number, number, number, number, number];

  const filtered = filterStar ? reviews.filter(r => r.rating === filterStar) : reviews;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(curPage, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const goTo = (p: number) => setCurPage(Math.max(1, Math.min(totalPages, p)));
  const pickStar = (s: number | null) => { setFilterStar(s); setCurPage(1); };

  // Windowed page numbers
  let lo = Math.max(1, safePage - 2);
  let hi = Math.min(totalPages, safePage + 2);
  if (hi - lo < 4) { if (lo === 1) hi = Math.min(totalPages, lo + 4); else lo = Math.max(1, hi - 4); }
  const pageNums: number[] = [];
  for (let i = lo; i <= hi; i++) pageNums.push(i);

  const avgDisplay = avgRating.toFixed(1);

  return (
    <div style={{ marginTop: '3.5rem' }}>
      <h2 className="serif" style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        Customer Reviews
      </h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading reviews…</div>
      ) : reviewCount === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '1.25rem', color: '#94a3b8' }}>
          No reviews yet for this product.
        </div>
      ) : (
        <>
          {/* ── Rating summary card ── */}
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', background: '#fff', borderRadius: '1.25rem', padding: '1.5rem 1.75rem', boxShadow: '0 2px 10px rgba(0,0,0,.05)', marginBottom: '1.5rem', alignItems: 'center' }}>

            {/* Big score */}
            <div style={{ textAlign: 'center', minWidth: 110, flexShrink: 0 }}>
              <div className="serif" style={{ fontSize: '3.75rem', fontWeight: 700, color: '#1e293b', lineHeight: 1 }}>
                {avgDisplay}
              </div>
              <div style={{ marginTop: 6 }}>
                <StarDisplay n={Math.round(avgRating)} size={20} />
              </div>
              <p style={{ fontSize: '.8rem', color: '#64748b', marginTop: '0.35rem' }}>
                {reviewCount.toLocaleString()} reviews
              </p>
            </div>

            <div style={{ width: 1, height: 80, background: '#f1f5f9', flexShrink: 0 }} />

            {/* Bar chart */}
            <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 7 }}>
              {[5, 4, 3, 2, 1].map(star => {
                const cnt = counts[star - 1];
                const pct = reviewCount ? Math.round(cnt / reviewCount * 100) : 0;
                const active = filterStar === star;
                return (
                  <button key={star}
                    onClick={() => pickStar(active ? null : star)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: '3px 6px', borderRadius: 8, transition: '.15s', outline: 'none' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--teal-xs)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                  >
                    <span style={{ fontSize: '.8rem', color: '#374151', width: 8, textAlign: 'right', flexShrink: 0, fontWeight: active ? 700 : 400 }}>{star}</span>
                    <span style={{ fontSize: 13, color: '#f59e0b', flexShrink: 0, lineHeight: 1 }}>★</span>
                    <div style={{ flex: 1, height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: active ? 'var(--teal)' : '#f59e0b', borderRadius: 4, transition: 'width .4s, background .2s', minWidth: pct > 0 ? 4 : 0 }} />
                    </div>
                    <span style={{ fontSize: '.78rem', color: '#64748b', width: 30, textAlign: 'right', flexShrink: 0 }}>{pct}%</span>
                    <span style={{ fontSize: '.75rem', color: '#94a3b8', width: 36, textAlign: 'right', flexShrink: 0 }}>({cnt.toLocaleString()})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Filter pills ── */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {([null, 5, 4, 3, 2, 1] as (number | null)[]).map(s => {
              const active = filterStar === s;
              return (
                <button key={s ?? 'all'}
                  onClick={() => pickStar(s)}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '.35rem .9rem', borderRadius: 9999, border: '1.5px solid', borderColor: active ? 'var(--teal)' : '#e2e8f0', background: active ? 'var(--teal)' : '#fff', color: active ? '#fff' : '#374151', fontSize: '.8rem', fontWeight: active ? 600 : 400, cursor: 'pointer', transition: '.15s' }}>
                  {s === null
                    ? 'All Reviews'
                    : <><span style={{ color: active ? '#fff' : '#f59e0b' }}>★</span>{s} Star</>}
                </button>
              );
            })}
          </div>

          {/* ── Review cards ── */}
          {paged.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '1.25rem', color: '#94a3b8' }}>
              No reviews for this star level.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {paged.map(rev => {
                const realName = rev.userName || `Customer #${rev.userId}`;
                const { text: commentText, isAnonymous } = unwrapComment(rev.comment);
                const label = isAnonymous ? maskName(realName) : realName;
                const initials = isAnonymous
                  ? realName.charAt(0).toUpperCase()
                  : realName
                      .split(' ')
                      .filter(Boolean)
                      .map(w => w[0])
                      .slice(-2)
                      .join('')
                      .toUpperCase() || String(rev.userId).slice(-2);
                const color = AVATAR_COLORS[rev.userId % AVATAR_COLORS.length];
                return (
                  <div key={rev.reviewId} style={{ background: '#fff', borderRadius: '1.25rem', padding: '1.25rem 1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,.05)' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{ width: 42, height: 42, borderRadius: '50%', background: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '.85rem', flexShrink: 0 }}>
                        {initials}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                          <span style={{ fontWeight: 600, fontSize: '.9rem', color: '#1e293b' }}>{label}</span>
                          <span style={{ fontSize: '.75rem', color: '#94a3b8' }}>{formatDate(rev.createdAt)}</span>
                        </div>
                        <div style={{ marginTop: 3 }}>
                          <StarDisplay n={rev.rating} size={14} />
                        </div>
                      </div>
                    </div>
                    {/* Body */}
                    {commentText && (
                      <p style={{ color: '#4b5563', fontSize: '.875rem', lineHeight: 1.65 }}>{commentText}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: '1.25rem' }}>
              <button onClick={() => goTo(safePage - 1)} disabled={safePage === 1}
                style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid', borderColor: safePage === 1 ? '#e2e8f0' : 'var(--teal)', background: '#fff', color: safePage === 1 ? '#cbd5e1' : 'var(--teal)', cursor: safePage === 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
              </button>
              {pageNums.map(n => (
                <button key={n} onClick={() => goTo(n)}
                  style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid', borderColor: n === safePage ? 'var(--teal)' : '#e2e8f0', background: n === safePage ? 'var(--teal)' : '#fff', color: n === safePage ? '#fff' : '#374151', fontWeight: n === safePage ? 700 : 400, cursor: 'pointer', fontSize: '.875rem' }}>
                  {n}
                </button>
              ))}
              <button onClick={() => goTo(safePage + 1)} disabled={safePage === totalPages}
                style={{ width: 34, height: 34, borderRadius: '50%', border: '1.5px solid', borderColor: safePage === totalPages ? '#e2e8f0' : 'var(--teal)', background: '#fff', color: safePage === totalPages ? '#cbd5e1' : 'var(--teal)', cursor: safePage === totalPages ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
