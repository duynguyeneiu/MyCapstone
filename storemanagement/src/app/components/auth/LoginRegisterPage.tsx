'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

type Tab = 'login' | 'register';

interface Props { defaultTab?: Tab; }

export default function LoginRegisterPage({ defaultTab = 'login' }: Props) {
  const router = useRouter();
  const { login, startRegister } = useAuth();
  const [tab, setTab] = useState<Tab>(defaultTab);

  // Login form
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPass, setLoginPass]   = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register form
  const [regName, setRegName]   = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPass, setRegPass]   = useState('');
  const [regPass2, setRegPass2] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);
  const [regError, setRegError] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const handleLogin = () => {
    if (!loginPhone || !loginPass) { setLoginError('Please fill in all fields'); return; }
    setLoginLoading(true);
    setTimeout(() => {
      const result = login(loginPhone, loginPass);
      setLoginLoading(false);
      if (!result.success) { setLoginError(result.error ?? 'Login failed'); return; }
      try {
        const savedUser = JSON.parse(localStorage.getItem('hm-user') || '{}');
        if (savedUser.role === 'admin' || savedUser.role === 'staff') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } catch {
        router.push('/');
      }
    }, 600);
  };

  const handleRegister = () => {
    if (!regName || !regPhone || !regPass || !regPass2) { setRegError('Please fill in all fields'); return; }
    if (regPass !== regPass2) { setRegError('Passwords do not match'); return; }
    if (regPass.length < 6) { setRegError('Password must be at least 6 characters'); return; }
    setRegLoading(true);
    setTimeout(() => {
      const result = startRegister(regName, regPhone, regPass);
      setRegLoading(false);
      if (!result.success) { setRegError(result.error ?? 'Registration failed'); return; }
      router.push('/register/verify');
    }, 600);
  };

  const demoAccounts = [
    { role: 'Client', phone: '0901234569', pass: 'client123', color: '#00694c', bg: '#e0f5ed' },
    { role: 'Admin',  phone: '0901234567', pass: 'admin123',  color: '#b47b10', bg: '#fff3d6' },
    { role: 'Staff',  phone: '0901234568', pass: 'staff123',  color: '#1d6fb8', bg: '#dbeafe' },
  ];

  const inputStyle: React.CSSProperties = {
    width: '100%', border: '1.5px solid #c8e4d8', borderRadius: 10,
    padding: '11px 44px 11px 14px', fontSize: 14, outline: 'none',
    background: '#f4fbf7', fontFamily: "'DM Sans', sans-serif", transition: 'border-color .15s',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'DM Sans', sans-serif" }}>

      {/* Left – Branding */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg,#00694c 0%,#004d38 60%,#003028 100%)',
        padding: '3rem', position: 'relative', overflow: 'hidden', minWidth: 0,
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: .07, backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><circle cx='10' cy='10' r='1.5' fill='white'/></svg>")` }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', color: '#fff', maxWidth: 400 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2.5rem' }}>
            🛍️
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 700, marginBottom: '0.75rem', lineHeight: 1.2 }}>
            Happy Market
          </h1>
          <p style={{ color: '#b8e0cc', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            Fresh finds delivered daily. Home appliances, gourmet food & premium beauty products.
          </p>
          <div style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 14, padding: '1.25rem', textAlign: 'left' }}>
            <p style={{ fontSize: '.75rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '0.75rem' }}>
              Demo Accounts
            </p>
            {demoAccounts.map(a => (
              <div key={a.role}
                onClick={() => { setTab('login'); setLoginPhone(a.phone); setLoginPass(a.pass); setLoginError(''); }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ background: a.bg, color: a.color, borderRadius: 99, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>{a.role}</span>
                  <span style={{ fontSize: 12, color: '#b8e0cc' }}>{a.phone}</span>
                </div>
                <span style={{ fontSize: 11, color: '#86c5a8', background: 'rgba(255,255,255,.1)', borderRadius: 6, padding: '2px 6px' }}>click to fill</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right – Form */}
      <div style={{
        width: 'min(480px, 100%)', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '3rem 2.5rem',
        background: '#fff', overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          {/* Tabs */}
          <div style={{ display: 'flex', background: '#f4fbf7', borderRadius: 12, padding: 4, marginBottom: '2rem' }}>
            {(['login', 'register'] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setLoginError(''); setRegError(''); }}
                style={{
                  flex: 1, padding: '0.65rem', borderRadius: 10, border: 'none', cursor: 'pointer',
                  fontWeight: 600, fontSize: '.9rem', fontFamily: "'DM Sans', sans-serif",
                  background: tab === t ? '#fff' : 'transparent',
                  color: tab === t ? '#00694c' : '#6d7a73',
                  boxShadow: tab === t ? '0 2px 8px rgba(0,0,0,.08)' : 'none',
                  transition: 'all .2s',
                }}>
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {/* ── LOGIN FORM ── */}
          {tab === 'login' && (
            <div style={{ animation: 'fadeIn .3s ease' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', fontWeight: 700, color: '#191c1e', marginBottom: '.25rem' }}>Welcome back</h2>
              <p style={{ color: '#6d7a73', fontSize: '.875rem', marginBottom: '1.75rem' }}>Sign in to your Happy Market account</p>

              {loginError && (
                <div style={{ background: '#ffdad6', border: '1px solid #ffb4ab', borderRadius: 10, padding: '10px 14px', marginBottom: '1rem', fontSize: 13, color: '#ba1a1a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  ⚠ {loginError}
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#3d4943', display: 'block', marginBottom: 5 }}>Phone Number</label>
                <input
                  type="tel" value={loginPhone} onChange={e => { setLoginPhone(e.target.value); setLoginError(''); }}
                  placeholder="e.g. 0901234567" style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = '#00694c'; e.currentTarget.style.background = '#fff'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#c8e4d8'; e.currentTarget.style.background = '#f4fbf7'; }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
              </div>

              <div style={{ marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#3d4943' }}>Password</label>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#00694c', fontWeight: 600, fontFamily: "'DM Sans', sans-serif", padding: 0 }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showLoginPass ? 'text' : 'password'} value={loginPass}
                    onChange={e => { setLoginPass(e.target.value); setLoginError(''); }}
                    placeholder="Enter password" style={inputStyle}
                    onFocus={e => { e.currentTarget.style.borderColor = '#00694c'; e.currentTarget.style.background = '#fff'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#c8e4d8'; e.currentTarget.style.background = '#f4fbf7'; }}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  />
                  <button onClick={() => setShowLoginPass(!showLoginPass)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#6d7a73' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                      {showLoginPass ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }} />

              <button onClick={handleLogin} disabled={loginLoading}
                style={{
                  width: '100%', padding: '13px', background: loginLoading ? '#86c5a8' : 'linear-gradient(135deg,#00694c,#00a86b)',
                  color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700,
                  cursor: loginLoading ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif",
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 4px 14px rgba(0,105,76,.3)', transition: 'all .2s',
                }}>
                {loginLoading ? 'Signing in…' : 'Sign In →'}
              </button>

              <p style={{ textAlign: 'center', fontSize: 13, color: '#6d7a73', marginTop: '1.25rem' }}>
                New to Happy Market?{' '}
                <button onClick={() => setTab('register')}
                  style={{ background: 'none', border: 'none', color: '#00694c', fontWeight: 700, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
                  Create account
                </button>
              </p>
            </div>
          )}

          {/* ── REGISTER FORM ── */}
          {tab === 'register' && (
            <div style={{ animation: 'fadeIn .3s ease' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', fontWeight: 700, color: '#191c1e', marginBottom: '.25rem' }}>Create account</h2>
              <p style={{ color: '#6d7a73', fontSize: '.875rem', marginBottom: '1.75rem' }}>Join Happy Market — it's free!</p>

              {regError && (
                <div style={{ background: '#ffdad6', border: '1px solid #ffb4ab', borderRadius: 10, padding: '10px 14px', marginBottom: '1rem', fontSize: 13, color: '#ba1a1a' }}>
                  ⚠ {regError}
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#3d4943', display: 'block', marginBottom: 5 }}>Full Name</label>
                <input type="text" value={regName} onChange={e => { setRegName(e.target.value); setRegError(''); }}
                  placeholder="Your full name" style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = '#00694c'; e.currentTarget.style.background = '#fff'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#c8e4d8'; e.currentTarget.style.background = '#f4fbf7'; }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#3d4943', display: 'block', marginBottom: 5 }}>Phone Number</label>
                <input type="tel" value={regPhone} onChange={e => { setRegPhone(e.target.value); setRegError(''); }}
                  placeholder="e.g. 0912345678" style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = '#00694c'; e.currentTarget.style.background = '#fff'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#c8e4d8'; e.currentTarget.style.background = '#f4fbf7'; }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#3d4943', display: 'block', marginBottom: 5 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showRegPass ? 'text' : 'password'} value={regPass}
                    onChange={e => { setRegPass(e.target.value); setRegError(''); }}
                    placeholder="At least 6 characters" style={inputStyle}
                    onFocus={e => { e.currentTarget.style.borderColor = '#00694c'; e.currentTarget.style.background = '#fff'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = '#c8e4d8'; e.currentTarget.style.background = '#f4fbf7'; }}
                  />
                  <button onClick={() => setShowRegPass(!showRegPass)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#6d7a73' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                      {showRegPass ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#3d4943', display: 'block', marginBottom: 5 }}>Confirm Password</label>
                <input type="password" value={regPass2}
                  onChange={e => { setRegPass2(e.target.value); setRegError(''); }}
                  placeholder="Repeat password" style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = '#00694c'; e.currentTarget.style.background = '#fff'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#c8e4d8'; e.currentTarget.style.background = '#f4fbf7'; }}
                  onKeyDown={e => e.key === 'Enter' && handleRegister()}
                />
              </div>

              <button onClick={handleRegister} disabled={regLoading}
                style={{
                  width: '100%', padding: '13px', background: regLoading ? '#86c5a8' : 'linear-gradient(135deg,#00694c,#00a86b)',
                  color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700,
                  cursor: regLoading ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif",
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 4px 14px rgba(0,105,76,.3)',
                }}>
                {regLoading ? 'Creating account…' : 'Create Account →'}
              </button>

              <p style={{ textAlign: 'center', fontSize: 12, color: '#6d7a73', marginTop: '1rem' }}>
                By registering you agree to our{' '}
                <span style={{ color: '#00694c', cursor: 'pointer', fontWeight: 600 }}>Terms of Service</span>
              </p>

              <p style={{ textAlign: 'center', fontSize: 13, color: '#6d7a73', marginTop: '0.75rem' }}>
                Already have an account?{' '}
                <button onClick={() => setTab('login')}
                  style={{ background: 'none', border: 'none', color: '#00694c', fontWeight: 700, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>
                  Sign in
                </button>
              </p>
            </div>
          )}
        </div>

        <p style={{ marginTop: '2rem', fontSize: 12, color: '#bccac1', textAlign: 'center' }}>© 2025 Happy Market. All rights reserved.</p>
      </div>

      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}
