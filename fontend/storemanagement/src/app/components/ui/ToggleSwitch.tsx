'use client';

import React, { useState } from 'react';

export default function ToggleSwitch({ defaultOn }: { defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div
      onClick={() => setOn(v => !v)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        background: on ? 'var(--teal)' : '#e2e8f0',
        cursor: 'pointer',
        position: 'relative',
        transition: '.2s',
        flexShrink: 0,
        marginLeft: 12,
      }}
    >
      <div style={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: '#fff',
        position: 'absolute',
        top: 2,
        left: on ? 22 : 2,
        transition: '.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,.2)',
      }} />
    </div>
  );
}
