'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OtpInput, { OTP_LENGTH, emptyOtp } from '../components/auth/OtpInput';
import { authService, getRetryAfterSeconds } from '../../services/authService';
import { getApiErrorMessage } from '../../lib/apiError';

type Step = 'phone' | 'otp' | 'reset' | 'done';

const STEP_TEXT: Record<Step, { icon: string; title: string; subtitle: string }> = {
  phone: { icon: 'lock_reset', title: 'Forgot Password', subtitle: 'Enter your registered phone number to receive a verification code.' },
  otp:   { icon: 'smartphone', title: 'Enter Code',      subtitle: `We sent a ${OTP_LENGTH}-digit code to` },
  reset: { icon: 'key',        title: 'New Password',    subtitle: 'Choose a new password for your account.' },
  done:  { icon: 'check',      title: 'Password Updated', subtitle: 'You can now sign in with your new password.' },
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('phone');

  const [phone, setPhone] = useState('');
  const [digits, setDigits] = useState<string[]>(emptyOtp());
  const [token, setToken] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newPass2, setNewPass2] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const secondsLeft = Math.max(0, Math.ceil((resendAt - now) / 1000));

  const resetMessages = () => { setError(''); setInfo(''); };

  // ===== Bước 1: gửi OTP =====
  const sendCode = async (isResend = false) => {
    if (!phone.trim()) { setError('Please enter your phone number'); return; }
    setLoading(true);
    resetMessages();
    try {
      const data = await authService.sendOtp(phone.trim(), 'ForgotPassword');
      setResendAt(Date.now() + data.retryAfterSeconds * 1000);
      setDigits(emptyOtp());
      setStep('otp');
      if (isResend) setInfo('A new code has been sent.');
    } catch (err) {
      const retryAfter = getRetryAfterSeconds(err);
      if (retryAfter > 0) {
        // Mã vừa được gửi gần đây -> vẫn cho nhập mã
        setResendAt(Date.now() + retryAfter * 1000);
        setStep('otp');
        if (isResend) setError(getApiErrorMessage(err));
      } else {
        setError(getApiErrorMessage(err, 'Could not send verification code'));
      }
    } finally {
      setLoading(false);
    }
  };

  // ===== Bước 2: verify OTP =====
  const verifyCode = async () => {
    const code = digits.join('');
    if (code.length < OTP_LENGTH) { setError(`Please enter the ${OTP_LENGTH}-digit code`); return; }
    setLoading(true);
    resetMessages();
    try {
      const data = await authService.verifyOtp(phone.trim(), 'ForgotPassword', code);
      if (!data.verificationToken) { setError(data.message); return; }
      setToken(data.verificationToken);
      setStep('reset');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Verification failed'));
      setDigits(emptyOtp());
    } finally {
      setLoading(false);
    }
  };

  // ===== Bước 3: đặt mật khẩu mới =====
  const resetPassword = async () => {
    if (!newPass || !newPass2) { setError('Please fill in all fields'); return; }
    if (newPass.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (newPass !== newPass2) { setError('Passwords do not match'); return; }
    setLoading(true);
    resetMessages();
    try {
      await authService.resetPassword({
        phone: phone.trim(),
        newPassword: newPass,
        confirmNewPassword: newPass2,
        verificationToken: token,
      });
      setStep('done');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not reset password'));
    } finally {
      setLoading(false);
    }
  };

  // ===== UI =====
  const inputStyle: React.CSSProperties = {
    width: '100%', border: '1.5px solid #c8e4d8', borderRadius: 10, padding: '11px 14px',
    fontSize: 14, outline: 'none', background: '#f4fbf7', fontFamily: "'DM Sans', sans-serif",
    boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 12, fontWeight: 600, color: '#3d4943', marginBottom: 5, textAlign: 'left',
  };
  const primaryBtn = (disabled: boolean): React.CSSProperties => ({
    width: '100%', padding: '13px',
    background: disabled ? '#86c5a8' : 'linear-gradient(135deg,#00694c,#00a86b)',
    color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif",
    boxShadow: '0 4px 14px rgba(0,105,76,.3)', transition: 'all .2s',
  });
  const linkBtn = (disabled = false): React.CSSProperties => ({
    background: 'none', border: 'none', fontWeight: 700, fontSize: 13, fontFamily: 'inherit',
    color: disabled ? '#9aa8a1' : '#00694c', cursor: disabled ? 'not-allowed' : 'pointer',
  });

  const text = STEP_TEXT[step];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', fontFamily: "'DM Sans', sans-serif", padding: '2rem' }}>
      <div style={{ background: '#fff', borderRadius: '1.5rem', padding: '3rem 2.5rem', width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,.1)', textAlign: 'center' }}>

        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#00694c,#00a86b)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#fff' }}>{text.icon}</span>
        </div>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.75rem', fontWeight: 700, color: '#191c1e', marginBottom: '0.5rem' }}>
          {text.title}
        </h1>
        <p style={{ color: '#6d7a73', fontSize: '.9rem', lineHeight: 1.6, marginBottom: step === 'otp' ? '0.75rem' : '1.75rem' }}>
          {text.subtitle}
        </p>
        {step === 'otp' && (
          <p style={{ fontWeight: 700, fontSize: '1rem', color: '#00694c', marginBottom: '2rem' }}>{phone}</p>
        )}

        {/* Bước 1 */}
        {step === 'phone' && (
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>Phone Number</label>
            <input
              type="tel"
              value={phone}
              placeholder="e.g. 0901234567"
              onChange={(e) => { setPhone(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && sendCode()}
              style={inputStyle}
            />
          </div>
        )}

        {/* Bước 2 */}
        {step === 'otp' && (
          <OtpInput
            digits={digits}
            onChange={(next) => { setDigits(next); setError(''); }}
            hasError={!!error}
            disabled={loading}
          />
        )}

        {/* Bước 3 */}
        {step === 'reset' && (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={newPass}
                  placeholder="At least 6 characters"
                  onChange={(e) => { setNewPass(e.target.value); setError(''); }}
                  style={{ ...inputStyle, paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6d7a73' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    {showPass ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Confirm New Password</label>
              <input
                type="password"
                value={newPass2}
                placeholder="Repeat password"
                onChange={(e) => { setNewPass2(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && resetPassword()}
                style={inputStyle}
              />
            </div>
          </>
        )}

        {error && (
          <div style={{ background: '#ffdad6', border: '1px solid #ffb4ab', borderRadius: 10, padding: '10px 14px', marginBottom: '1rem', fontSize: 13, color: '#ba1a1a', textAlign: 'left' }}>
            ⚠ {error}
          </div>
        )}
        {info && !error && (
          <div style={{ background: '#e6f6ee', border: '1px solid #b7e2cc', borderRadius: 10, padding: '10px 14px', marginBottom: '1rem', fontSize: 13, color: '#00694c' }}>
            {info}
          </div>
        )}

        {step === 'phone' && (
          <button onClick={() => sendCode()} disabled={loading} style={primaryBtn(loading)}>
            {loading ? 'Sending…' : 'Send Code →'}
          </button>
        )}
        {step === 'otp' && (
          <button onClick={verifyCode} disabled={loading} style={primaryBtn(loading)}>
            {loading ? 'Verifying…' : 'Verify Code →'}
          </button>
        )}
        {step === 'reset' && (
          <button onClick={resetPassword} disabled={loading} style={primaryBtn(loading)}>
            {loading ? 'Saving…' : 'Update Password →'}
          </button>
        )}
        {step === 'done' && (
          <button onClick={() => router.push('/login')} style={primaryBtn(false)}>
            Go to Sign In →
          </button>
        )}

        {step === 'otp' && (
          <>
            <p style={{ marginTop: '1.25rem', fontSize: 13, color: '#6d7a73' }}>
              Didn&apos;t get the code?{' '}
              <button
                onClick={() => sendCode(true)}
                disabled={secondsLeft > 0 || loading}
                style={linkBtn(secondsLeft > 0 || loading)}
              >
                {secondsLeft > 0 ? `Resend in ${secondsLeft}s` : 'Resend code'}
              </button>
            </p>
            <p style={{ marginTop: '0.5rem', fontSize: 13, color: '#6d7a73' }}>
              Wrong number?{' '}
              <button onClick={() => { setStep('phone'); resetMessages(); }} style={linkBtn()}>
                Change
              </button>
            </p>
          </>
        )}

        {step !== 'done' && (
          <p style={{ marginTop: step === 'otp' ? '0.5rem' : '1.25rem', fontSize: 13, color: '#6d7a73' }}>
            Remembered it?{' '}
            <button onClick={() => router.push('/login')} style={linkBtn()}>
              Back to Sign In
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
