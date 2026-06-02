'use client';

import React, { useEffect, useRef } from 'react';
import { PaymentMethod } from '../../lib/types';
import { fmt } from '../../lib/utils';
import BtnTeal from './BtnTeal';

interface QRModalProps {
  method: PaymentMethod;
  total: number;
  onClose: () => void;
  onConfirm: () => void;
}

export default function QRModal({ method, total, onClose, onConfirm }: QRModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMomo = method === 'momo';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const size = 180; const module = 6; const modules = 30; const seed = isMomo ? 42 : 77;
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size);
    const rand = (x: number, y: number) => ((x * 1234567 + y * 7654321 + seed * 999983) % 1000) / 1000;
    const color = isMomo ? '#a21caf' : '#00694c';
    for (let r = 0; r < modules; r++) {
      for (let c = 0; c < modules; c++) {
        const inF = (r < 7 && c < 7) || (r < 7 && c > modules - 8) || (r > modules - 8 && c < 7);
        if (inF) {
          const edge = r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
          const inside = r > 0 && r < 6 && c > 0 && c < 6 && !edge;
          ctx.fillStyle = inside ? '#fff' : color;
          ctx.fillRect(c * module, r * module, module, module);
        } else if (rand(r, c) > 0.5) {
          ctx.fillStyle = color; ctx.fillRect(c * module, r * module, module, module);
        }
      }
    }
    ctx.fillStyle = '#fff'; ctx.fillRect(70, 70, 40, 40);
    ctx.font = '24px serif'; ctx.fillText(isMomo ? '💜' : '🏦', 72, 98);
  }, [isMomo]);

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: '1.5rem', padding: '2rem', width: '90%', maxWidth: 380, boxShadow: '0 20px 60px rgba(0,0,0,.2)', textAlign: 'center' }}
      >
        <h3 className="serif" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 4 }}>
          {isMomo ? '💜 Pay with MoMo' : '🏦 Bank Transfer'}
        </h3>
        <p style={{ color: '#64748b', fontSize: '.875rem', marginBottom: '1rem' }}>
          {isMomo ? 'Open MoMo app → scan QR → confirm' : 'Open banking app → scan QR → transfer'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <div style={{ padding: '0.75rem', border: `4px solid var(--teal)`, borderRadius: '1rem' }}>
            <canvas ref={canvasRef} width={180} height={180} />
          </div>
        </div>
        <div style={{ background: 'var(--teal-xs)', borderRadius: '0.75rem', padding: '0.75rem', marginBottom: '1rem' }}>
          <p style={{ fontSize: '.75rem', color: '#64748b' }}>Amount to Pay</p>
          <p className="serif" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--teal)' }}>{fmt(total)}</p>
        </div>
        <p style={{ fontSize: '.75rem', color: '#94a3b8', marginBottom: '1rem' }}>After scanning, click &quot;I&apos;ve Paid&quot; below to confirm.</p>
        <BtnTeal onClick={onConfirm} style={{ width: '100%', padding: '0.75rem' }}>I&apos;ve Paid ✓</BtnTeal>
      </div>
    </div>
  );
}
