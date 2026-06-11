'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function VerifyPage() {
  const router = useRouter();
  const { pendingPhone, completeRegister } = useAuth();
  const [digits, setDigits] = useState(['', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect away if there's no pending registration
  useEffect(() => {
    if (pendingPhone === null) {
      // Give a tick for context to hydrate from localStorage
      const t = setTimeout(() => {
        if (pendingPhone === null) router.replace('/register');
      }, 500);
      return () => clearTimeout(t);
    }
  }, [pendingPhone, router]);

  const handleDigit = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    setError('');
    if (value && index < 4) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 5);
    if (pasted.length === 5) {
      setDigits(pasted.split(''));
      inputRefs.current[4]?.focus();
    }
    e.preventDefault();
  };

  const handleVerify = () => {
    const otp = digits.join('');
    if (otp.length < 5) { setError('Please enter the 5-digit code'); return; }
    setLoading(true);
    setTimeout(() => {
      const result = completeRegister(otp);
      setLoading(false);
      if (!result.success) { setError(result.error ?? 'Verification failed'); return; }
      router.push('/');
    }, 700);
  };

  const inputStyle: React.CSSProperties = {
    width: 56, height: 64, borderRadius: 12, border: '2px solid #c8e4d8',
    textAlign: 'center', fontSize: '1.5rem', fontWeight: 700, outline: 'none',
    background: '#f4fbf7', fontFamily: "'DM Sans', sans-serif", transition: 'border-color .15s',
    caretColor: 'transparent',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', fontFamily: "'DM Sans', sans-serif", padding: '2rem' }}>
      <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '3rem 2.5rem', width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,.1)', textAlign: 'center' }}>

        {/* Icon */}
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#00694c,#00a86b)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#fff' }}>smartphone</span>
        </div>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: '#191c1e', marginBottom: '0.5rem' }}>
          Verify Your Number
        </h1>
        <p style={{ color: '#6d7a73', fontSize: '.9rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
          We sent a 5-digit code to
        </p>
        {pendingPhone && (
          <p style={{ fontWeight: 700, fontSize: '1rem', color: '#00694c', marginBottom: '2rem' }}>
            {pendingPhone}
          </p>
        )}

        {/* Demo hint */}
        <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 10, padding: '0.65rem 1rem', marginBottom: '1.75rem', fontSize: 13, color: '#7c5900' }}>
          Demo code: <strong>12345</strong>
        </div>

        {/* OTP inputs */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: '1.5rem' }} onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleDigit(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              style={{
                ...inputStyle,
                borderColor: d ? '#00694c' : error ? '#ef4444' : '#c8e4d8',
                background: d ? '#f0fdf4' : '#f4fbf7',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#00694c'; e.currentTarget.style.background = '#fff'; }}
              onBlur={e => { e.currentTarget.style.borderColor = digits[i] ? '#00694c' : '#c8e4d8'; e.currentTarget.style.background = digits[i] ? '#f0fdf4' : '#f4fbf7'; }}
            />
          ))}
        </div>

        {error && (
          <div style={{ background: '#ffdad6', border: '1px solid #ffb4ab', borderRadius: 10, padding: '10px 14px', marginBottom: '1rem', fontSize: 13, color: '#ba1a1a' }}>
            ⚠ {error}
          </div>
        )}

        <button
          onClick={handleVerify}
          disabled={loading}
          style={{
            width: '100%', padding: '13px',
            background: loading ? '#86c5a8' : 'linear-gradient(135deg,#00694c,#00a86b)',
            color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif",
            boxShadow: '0 4px 14px rgba(0,105,76,.3)', transition: 'all .2s',
          }}
        >
          {loading ? 'Verifying…' : 'Verify & Create Account →'}
        </button>

        <p style={{ marginTop: '1.25rem', fontSize: 13, color: '#6d7a73' }}>
          Wrong number?{' '}
          <button
            onClick={() => router.push('/register')}
            style={{ background: 'none', border: 'none', color: '#00694c', fontWeight: 700, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}
          >
            Go back
          </button>
        </p>
      </div>
    </div>
  );
}
