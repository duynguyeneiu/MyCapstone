'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import OtpInput, { OTP_LENGTH, emptyOtp } from '../../components/auth/OtpInput';

export default function VerifyPage() {
  const router = useRouter();
  const { pendingPhone, pendingResendAt, completeRegister, resendRegisterOtp } = useAuth();
  const [digits, setDigits] = useState<string[]>(emptyOtp());
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const doneRef = useRef(false);

  // Không có phiên đăng ký (vd: refresh trang) -> quay lại form
  useEffect(() => {
    if (pendingPhone === null && !doneRef.current) {
      const t = setTimeout(() => router.replace('/register'), 500);
      return () => clearTimeout(t);
    }
  }, [pendingPhone, router]);

  // Đồng hồ đếm ngược cho nút "Resend"
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const secondsLeft = pendingResendAt
    ? Math.max(0, Math.ceil((pendingResendAt - now) / 1000))
    : 0;

  const handleChange = (next: string[]) => {
    setDigits(next);
    setError('');
  };

  const handleVerify = async () => {
    const otp = digits.join('');
    if (otp.length < OTP_LENGTH) {
      setError(`Please enter the ${OTP_LENGTH}-digit code`);
      return;
    }
    setLoading(true);
    setInfo('');
    doneRef.current = true; // tránh effect đẩy về /register khi pending bị xoá lúc thành công
    const result = await completeRegister(otp);
    if (!result.success) {
      doneRef.current = false;
      setLoading(false);
      setError(result.error ?? 'Verification failed');
      setDigits(emptyOtp());
      return;
    }
    router.push('/');
  };

  const handleResend = async () => {
    if (secondsLeft > 0 || resending) return;
    setResending(true);
    setError('');
    setInfo('');
    const result = await resendRegisterOtp();
    setResending(false);
    if (!result.success) {
      setError(result.error ?? 'Could not resend code');
      return;
    }
    setDigits(emptyOtp());
    setInfo('A new code has been sent.');
  };

  const resendDisabled = secondsLeft > 0 || resending;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', fontFamily: "'DM Sans', sans-serif", padding: '2rem' }}>
      <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '3rem 2.5rem', width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,.1)', textAlign: 'center' }}>

        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#00694c,#00a86b)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#fff' }}>smartphone</span>
        </div>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: '#191c1e', marginBottom: '0.5rem' }}>
          Verify Your Number
        </h1>
        <p style={{ color: '#6d7a73', fontSize: '.9rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
          We sent a {OTP_LENGTH}-digit code to
        </p>
        {pendingPhone && (
          <p style={{ fontWeight: 700, fontSize: '1rem', color: '#00694c', marginBottom: '2rem' }}>
            {pendingPhone}
          </p>
        )}

        <OtpInput digits={digits} onChange={handleChange} hasError={!!error} disabled={loading} />

        {error && (
          <div style={{ background: '#ffdad6', border: '1px solid #ffb4ab', borderRadius: 10, padding: '10px 14px', marginBottom: '1rem', fontSize: 13, color: '#ba1a1a' }}>
            ⚠ {error}
          </div>
        )}
        {info && !error && (
          <div style={{ background: '#e6f6ee', border: '1px solid #b7e2cc', borderRadius: 10, padding: '10px 14px', marginBottom: '1rem', fontSize: 13, color: '#00694c' }}>
            {info}
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
          Didn&apos;t get the code?{' '}
          <button
            onClick={handleResend}
            disabled={resendDisabled}
            style={{
              background: 'none', border: 'none', fontWeight: 700, fontSize: 13, fontFamily: 'inherit',
              color: resendDisabled ? '#9aa8a1' : '#00694c',
              cursor: resendDisabled ? 'not-allowed' : 'pointer',
            }}
          >
            {resending ? 'Sending…' : secondsLeft > 0 ? `Resend in ${secondsLeft}s` : 'Resend code'}
          </button>
        </p>

        <p style={{ marginTop: '0.5rem', fontSize: 13, color: '#6d7a73' }}>
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
