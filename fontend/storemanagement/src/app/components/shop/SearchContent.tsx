'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PRODUCTS } from '../../lib/data';
import ProductCard from '../ui/ProductCard';
import BtnTeal from '../ui/BtnTeal';
import Badge from '../ui/Badge';

interface SearchContentProps {
  initialTerm: string;
}

function matchesTerm(text: string, term: string): boolean {
  // Escape regex special chars, then require word-boundary at start of match
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}`, 'i').test(text);
}

export default function SearchContent({ initialTerm }: SearchContentProps) {
  const router = useRouter();

  const results = initialTerm
    ? PRODUCTS.filter(p =>
        matchesTerm(p.name, initialTerm) ||
        matchesTerm(p.desc, initialTerm) ||
        matchesTerm(p.category, initialTerm)
      )
    : [];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <h2 className="serif" style={{ fontSize: '1.75rem', fontWeight: 700 }}>Search Results</h2>
          {initialTerm && (
            <Badge>{results.length} result{results.length !== 1 ? 's' : ''}</Badge>
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
      {initialTerm && results.length === 0 && (
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '1.25rem' }}>
          {results.map(p => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}
