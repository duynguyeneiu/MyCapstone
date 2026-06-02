'use client';

import React from 'react';
import { useCart } from '../../context/CartContext';

export default function ToastDisplay() {
  const { toast } = useCart();
  if (!toast) return null;
  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'var(--teal)',
      color: '#fff',
      padding: '.75rem 1.75rem',
      borderRadius: 9999,
      fontWeight: 600,
      zIndex: 300,
      animation: 'toastIn .35s ease forwards',
      whiteSpace: 'nowrap',
      boxShadow: '0 8px 24px rgba(0,105,76,.4)',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      ✓ {toast}
    </div>
  );
}
