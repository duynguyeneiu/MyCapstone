'use client';

import React from 'react';

interface BtnTealProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  type?: 'button' | 'submit' | 'reset';
}

export default function BtnTeal({ children, onClick, className = '', style = {}, type = 'button' }: BtnTealProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={className}
      style={{
        background: 'var(--teal)',
        color: '#fff',
        borderRadius: 9999,
        padding: '.6rem 1.4rem',
        fontWeight: 600,
        fontSize: '.875rem',
        border: 'none',
        cursor: 'pointer',
        transition: 'all .2s',
        ...style,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--teal-dk)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--teal)'; }}
    >
      {children}
    </button>
  );
}
