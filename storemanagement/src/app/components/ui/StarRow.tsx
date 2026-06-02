import React from 'react';

interface StarRowProps {
  rating: number;
  size?: string;
}

export default function StarRow({ rating, size = 'text-base' }: StarRowProps) {
  return (
    <span className={size}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ color: i < Math.floor(rating) ? '#f59e0b' : '#e2e8f0' }}>★</span>
      ))}
    </span>
  );
}
