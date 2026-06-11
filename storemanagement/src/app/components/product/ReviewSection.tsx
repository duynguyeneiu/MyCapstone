'use client';

import React, { useState } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ReviewEntry {
  id: number;
  author: string;
  initials: string;
  avatarColor: string;
  stars: number;
  date: string;
  title: string;
  body: string;
  helpful: number;
}

// ─── Seeded RNG (deterministic per product) ──────────────────────────────────

function mkRng(seed: number) {
  let s = (seed >>> 0) || 1;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

// ─── Build star distribution that averages to `rating` ───────────────────────

function buildStarCounts(rating: number, total: number): [number, number, number, number, number] {
  const tgt = Math.round(rating * total);
  const s = 5 - rating;
  const minLow = s > 0 ? 1 : 0;

  const c1 = Math.max(minLow, Math.round(total * 0.010 * s));
  const c2 = Math.max(minLow, Math.round(total * 0.015 * s));
  const c3 = Math.max(minLow, Math.round(total * 0.025 * s));
  const rem = total - c1 - c2 - c3;
  const sumLow = c1 + 2 * c2 + 3 * c3;

  // Solve: 5*c5 + 4*c4 = tgt - sumLow, where c5 + c4 = rem
  let c5 = (tgt - sumLow) - 4 * rem;
  let c4 = rem - c5;
  if (c5 < 0) { c5 = 0; c4 = rem; }
  if (c4 < 0) { c4 = 0; c5 = rem; }

  return [c1, c2, c3, Math.max(0, c4), Math.max(0, c5)];
}

// ─── Generate fake review entries (deterministic) ────────────────────────────

function generateReviews(productId: number, rating: number, reviewCount: number): ReviewEntry[] {
  const counts = buildStarCounts(rating, reviewCount);
  const SHOW = 10;

  // Greedy proportional pool: 1 guaranteed per present star, rest proportional
  const pool: number[] = [];
  for (let star = 5; star >= 1; star--) {
    if (counts[star - 1] > 0 && pool.length < SHOW) pool.push(star);
  }
  while (pool.length < SHOW) {
    let best = 5, bestRatio = -Infinity;
    for (let star = 1; star <= 5; star++) {
      if (counts[star - 1] === 0) continue;
      const have = pool.filter(x => x === star).length;
      const want = (counts[star - 1] / reviewCount) * SHOW;
      if (want - have > bestRatio) { bestRatio = want - have; best = star; }
    }
    pool.push(best);
  }

  // Shuffle deterministically
  const rng = mkRng(productId * 31337 + 7);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const NAMES = ['Alex T.', 'Minh N.', 'Sara K.', 'David L.', 'Linh P.', 'James R.', 'Hoa V.', 'Michael B.', 'An T.', 'Sophie M.', 'Ryan C.', 'Mai D.'];
  const COLORS = ['#00694c', '#1d6fb8', '#b47b10', '#7c3aed', '#be185d', '#0369a1', '#166534', '#92400e'];
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const TITLES: Record<number, string[]> = {
    5: ['Absolutely love it!', "Best purchase I've made", 'Exceeded my expectations', 'Highly recommend!', 'Perfect — exactly as described', 'Outstanding quality', 'Will buy again'],
    4: ['Really good product', 'Very satisfied', 'Solid purchase', 'Great value for the price', 'Almost perfect', 'Happy with this buy'],
    3: ['Decent, but not great', "It's okay", 'Average product', 'Mixed feelings', 'Could be improved'],
    2: ['Disappointed', 'Not what I expected', 'Below average', 'Some quality issues'],
    1: ['Very disappointed', 'Terrible quality', 'Total waste of money', 'Complete disappointment'],
  };

  const BODIES: Record<number, string[]> = {
    5: [
      "This product is absolutely fantastic. The quality far exceeds what I expected for the price. It arrived well-packaged and in perfect condition. I've been using it daily and it continues to impress me. Highly recommend to anyone on the fence!",
      "I was a bit hesitant to order online, but this completely won me over. The quality is excellent and it looks even better in person. Delivery was fast and the packaging was secure. Will definitely be ordering again.",
      "One of the best purchases I've made this year. Everything about it — the quality, the feel, the performance — is top-notch. Friends and family have already asked me where I got it. Five stars without hesitation.",
      "Perfect product. Does exactly what it's supposed to do, and does it well. The materials feel premium and durable. Setup was straightforward. Couldn't be happier with this purchase.",
    ],
    4: [
      "Really good product overall. I've been using it for a few weeks and it's holding up well. The quality is solid and it looks great. Minor packaging issue when it arrived, but the product itself is perfect. Would buy again.",
      "Good value for the money. It works well and the build quality feels durable. A couple of small things could be improved, but for this price range it's hard to complain. Overall very satisfied.",
      "Solid purchase. Does the job reliably and looks nice. Shipping was a tiny bit slow but the product quality makes up for it. I'd recommend this to friends looking for a reliable option.",
    ],
    3: [
      "The product is decent but didn't quite live up to the listing photos. It works fine for basic use, but some details feel a bit cheap. For the price it's acceptable, but I expected a slightly more premium feel.",
      "Mixed feelings about this one. Some aspects are genuinely good, but others feel a bit lacking. It gets the job done without any major issues. I might look for alternatives next time, but it's not a bad purchase.",
      "Average product. Not great, not terrible. It works as described but doesn't have that wow factor. If you just need something functional and aren't too picky, this will do.",
    ],
    2: [
      "Unfortunately this didn't meet my expectations. The quality feels noticeably cheaper than the photos suggest. It works at a basic level but I've had a few minor issues already. For this price, I expected significantly better.",
      "Disappointed with this purchase. The product arrived with some cosmetic issues and doesn't feel as durable as described. Would not recommend at this price point.",
    ],
    1: [
      "Very disappointed. The product stopped working properly after just one week of light use. The build quality is poor and the materials feel extremely cheap. Would not buy again.",
      "Complete waste of money. The product doesn't function anywhere near as described. The quality is terrible. I've returned it and am looking for something better elsewhere.",
    ],
  };

  return pool.slice(0, SHOW).map((stars, i) => {
    const r2 = mkRng(productId * 7919 + i * 1234 + stars * 97);
    const nameIdx = (Math.floor(r2() * NAMES.length) + i) % NAMES.length;
    const titleArr = TITLES[stars];
    const bodyArr = BODIES[stars];
    const daysAgo = Math.floor(r2() * 500) + 10;
    const d = new Date(Date.now() - daysAgo * 86_400_000);
    const helpful = Math.floor(r2() * 120) + 3;
    const colorIdx = Math.floor(r2() * COLORS.length);
    const name = NAMES[nameIdx];

    return {
      id: productId * 1000 + i,
      author: name,
      initials: name.split(' ').map(w => w[0]).join(''),
      avatarColor: COLORS[colorIdx],
      stars,
      date: `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`,
      title: titleArr[Math.floor(r2() * titleArr.length)],
      body: bodyArr[Math.floor(r2() * bodyArr.length)],
      helpful,
    };
  });
}

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

// ─── Main component ───────────────────────────────────────────────────────────

interface Props { productId: number; rating: number; reviewCount: number; }

const PAGE_SIZE = 5;

export default function ReviewSection({ productId, rating, reviewCount }: Props) {
  const counts = buildStarCounts(rating, reviewCount); // [c1…c5]
  const allReviews = generateReviews(productId, rating, reviewCount);

  const [filterStar, setFilterStar] = useState<number | null>(null);
  const [curPage, setCurPage] = useState(1);

  const filtered = filterStar ? allReviews.filter(r => r.stars === filterStar) : allReviews;
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

  const avgDisplay = rating.toFixed(1);

  return (
    <div style={{ marginTop: '3.5rem' }}>
      <h2 className="serif" style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        Customer Reviews
      </h2>

      {/* ── Rating summary card ── */}
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', background: '#fff', borderRadius: '1.25rem', padding: '1.5rem 1.75rem', boxShadow: '0 2px 10px rgba(0,0,0,.05)', marginBottom: '1.5rem', alignItems: 'center' }}>

        {/* Big score */}
        <div style={{ textAlign: 'center', minWidth: 110, flexShrink: 0 }}>
          <div className="serif" style={{ fontSize: '3.75rem', fontWeight: 700, color: '#1e293b', lineHeight: 1 }}>
            {avgDisplay}
          </div>
          <div style={{ marginTop: 6 }}>
            <StarDisplay n={Math.round(rating)} size={20} />
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
            const pct = Math.round(cnt / reviewCount * 100);
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
          {paged.map(rev => (
            <div key={rev.id} style={{ background: '#fff', borderRadius: '1.25rem', padding: '1.25rem 1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,.05)' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: rev.avatarColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '.85rem', flexShrink: 0 }}>
                  {rev.initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: '.9rem', color: '#1e293b' }}>{rev.author}</span>
                    <span style={{ fontSize: '.75rem', color: '#94a3b8' }}>{rev.date}</span>
                  </div>
                  <div style={{ marginTop: 3 }}>
                    <StarDisplay n={rev.stars} size={14} />
                  </div>
                </div>
              </div>
              {/* Body */}
              <p style={{ fontWeight: 700, fontSize: '.9rem', color: '#1e293b', marginBottom: '0.4rem' }}>{rev.title}</p>
              <p style={{ color: '#4b5563', fontSize: '.875rem', lineHeight: 1.65 }}>{rev.body}</p>
              {/* Footer */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: '0.875rem', paddingTop: '0.75rem', borderTop: '1px solid #f8fafc' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#94a3b8' }}>thumb_up</span>
                <span style={{ fontSize: '.75rem', color: '#94a3b8' }}>{rev.helpful} people found this helpful</span>
              </div>
            </div>
          ))}
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
    </div>
  );
}
