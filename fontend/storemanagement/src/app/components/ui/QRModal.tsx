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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const size = 180; const module = 6; const modules = 30; const seed = 55;
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size);
    const rand = (x: number, y: number) => ((x * 1234567 + y * 7654321 + seed * 999983) % 1000) / 1000;
    const color = '#b91c1c';
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
    /* centre logo placeholder */
    ctx.fillStyle = '#fff'; ctx.fillRect(68, 68, 44, 44);
    ctx.fillStyle = '#b91c1c'; ctx.fillRect(72, 72, 36, 36);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('VN', 90, 87); ctx.fillText('Pay', 90, 102);
  }, [method]);

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: '1.5rem', padding: '2rem', width: '90%', maxWidth: 380, boxShadow: '0 20px 60px rgba(0,0,0,.2)', textAlign: 'center' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#b91c1c' }}>qr_code_2</span>
          </div>
          <h3 className="serif" style={{ fontSize: '1.25rem', fontWeight: 700 }}>Pay with VNPay</h3>
        </div>
        <p style={{ color: '#64748b', fontSize: '.875rem', marginBottom: '1rem' }}>
          Open VNPay app → scan QR → confirm payment
        </p>

        {/* QR canvas */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <div style={{ padding: '0.75rem', border: '4px solid #b91c1c', borderRadius: '1rem' }}>
            <canvas ref={canvasRef} width={180} height={180} />
          </div>
        </div>

        {/* Amount */}
        <div style={{ background: '#fee2e2', borderRadius: '0.75rem', padding: '0.75rem', marginBottom: '1rem' }}>
          <p style={{ fontSize: '.75rem', color: '#b91c1c' }}>Amount to Pay</p>
          <p className="serif" style={{ fontSize: '1.75rem', fontWeight: 700, color: '#b91c1c' }}>{fmt(total)}</p>
        </div>

        <p style={{ fontSize: '.75rem', color: '#94a3b8', marginBottom: '1rem' }}>After scanning, click &quot;I&apos;ve Paid&quot; below to confirm.</p>
        <BtnTeal onClick={onConfirm} style={{ width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
          I&apos;ve Paid
        </BtnTeal>
      </div>
    </div>
  );
}
