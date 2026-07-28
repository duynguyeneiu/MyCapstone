'use client';

import React, { useState } from 'react';

interface BtnOutlineProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  danger?: boolean;
  style?: React.CSSProperties;
}

export default function BtnOutline({ children, onClick, className = '', danger = false, style = {} }: BtnOutlineProps) {
  const [hov, setHov] = useState(false);
  const bc = danger ? '#ef4444' : 'var(--teal)';
  return (
    <button
      onClick={onClick}
      className={className}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        border: `2px solid ${bc}`,
        color: hov ? '#fff' : bc,
        borderRadius: 9999,
        padding: '.5rem 1.4rem',
        fontWeight: 600,
        fontSize: '.875rem',
        background: hov ? bc : 'transparent',
        cursor: 'pointer',
        transition: 'all .2s',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
