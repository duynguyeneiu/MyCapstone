'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPageNums } from '@/src/lib/utils';
import ProductCard from '../ui/ProductCard';
import BtnTeal from '../ui/BtnTeal';
import Badge from '../ui/Badge';
import { productService } from '@/src/services/productService';
import { Product } from '@/src/lib/data';

interface SearchContentProps {
  initialTerm: string;
}

const PAGE_SIZE = 12;

export default function SearchContent({ initialTerm }: SearchContentProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<Product[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Reset to page 1 whenever the search term changes — adjusting state
  // during render avoids an extra cascading effect render.
  const [prevTerm, setPrevTerm] = useState(initialTerm);
  if (prevTerm !== initialTerm) {
    setPrevTerm(initialTerm);
    setPage(1);
  }

  useEffect(() => {
    if (!initialTerm) {
      setResults([]);
      setTotalItems(0);
      setTotalPages(1);
      return;
    }
    let cancelled = false;
    setLoading(true);
    productService
      .getPaged({ keyword: initialTerm, page, pageSize: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        setResults(res.items);
        setTotalItems(res.totalItems);
        setTotalPages(Math.max(1, res.totalPages));
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initialTerm, page]);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <h2 className="serif" style={{ fontSize: '1.75rem', fontWeight: 700 }}>Search Results</h2>
          {initialTerm && (
            <Badge>{totalItems} result{totalItems !== 1 ? 's' : ''}</Badge>
          )}
        </div>
        {initialTerm && (
          <p style={{ color: '#64748b', fontSize: '.875rem', marginTop: '0.35rem' }}>
            Showing results for <strong style={{ color: '#1e293b' }}>&quot;{initialTerm}&quot;</strong>
          </p>
        )}
      </div>

      {/* No term */}
      {!initialTerm && (
        <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
          <span style={{ fontSize: '4rem' }}>🔍</span>
          <p className="serif" style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '1rem', marginBottom: '0.5rem' }}>
            Enter a keyword to search
          </p>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Use the search bar at the top to find products</p>
          <BtnTeal onClick={() => router.push('/shop')}>Browse All Products</BtnTeal>
        </div>
      )}

      {/* No results */}
      {initialTerm && !loading && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
          <span style={{ fontSize: '4rem' }}>🔍</span>
          <p className="serif" style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '1rem', marginBottom: '0.5rem' }}>
            No results found
          </p>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
            No products matched &quot;{initialTerm}&quot;. Try a different keyword.
          </p>
          <BtnTeal onClick={() => router.push('/shop')}>Browse All Products</BtnTeal>
        </div>
      )}

      {/* Results grid */}
      {results.length > 0 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '1.25rem' }}>
            {results.map(p => (
              <ProductCard key={p.id} p={p} categoryName={p.category ?? ''} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    width: 34, height: 34, borderRadius: '0.5rem', border: '1.5px solid',
                    borderColor: page === 1 ? '#e2e8f0' : 'var(--amber-border)',
                    background: page === 1 ? '#f8fafc' : 'var(--amber-xs)',
                    color: page === 1 ? '#cbd5e1' : 'var(--amber-dk)',
                    cursor: page === 1 ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
                </button>

                {getPageNums(page, totalPages).map((n, i) =>
                  n === '…' ? (
                    <span key={`e${i}`} style={{ width: 34, textAlign: 'center', color: '#94a3b8', fontSize: '.875rem' }}>…</span>
                  ) : (
                    <button
                      key={n}
                      onClick={() => setPage(n as number)}
                      style={{
                        width: 34, height: 34, borderRadius: '0.5rem', border: '1.5px solid',
                        borderColor: page === n ? 'var(--teal)' : 'var(--amber-border)',
                        background: page === n ? 'var(--teal)' : 'var(--amber-xs)',
                        color: page === n ? '#fff' : 'var(--amber-dk)',
                        fontWeight: page === n ? 700 : 500,
                        fontSize: '.875rem',
                        cursor: 'pointer',
                      }}
                    >
                      {n}
                    </button>
                  ),
                )}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    width: 34, height: 34, borderRadius: '0.5rem', border: '1.5px solid',
                    borderColor: page === totalPages ? '#e2e8f0' : 'var(--amber-border)',
                    background: page === totalPages ? '#f8fafc' : 'var(--amber-xs)',
                    color: page === totalPages ? '#cbd5e1' : 'var(--amber-dk)',
                    cursor: page === totalPages ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
