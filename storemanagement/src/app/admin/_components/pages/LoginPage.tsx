'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Props { onNav: (p: string) => void; }

const pageCSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Hanken+Grotesk:wght@600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
.material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; }
.staff-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:12px; margin-top:20px; }
.staff-card { background:#fff; border:1.5px solid #e0e3e5; border-radius:16px; padding:20px 16px; text-align:center; cursor:pointer; transition:all .15s; box-shadow:0 2px 8px rgba(0,0,0,0.06); }
.staff-card:hover { background:#f0faf5; border-color:#00694c; transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,105,76,0.12); }
.staff-avatar { width:56px; height:56px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:700; color:white; margin:0 auto 10px; }
.staff-name { font-size:13px; font-weight:600; color:#191c1e; }
.staff-role { font-size:11px; color:#6d7a73; margin-top:2px; }
.pin-card { background:#fff; border-radius:20px; padding:36px 32px; text-align:center; box-shadow:0 24px 60px rgba(0,0,0,0.25); }
.pin-dots { display:flex; justify-content:center; gap:12px; margin:24px 0 20px; }
.pin-dot { width:14px; height:14px; border-radius:50%; background:#eceef0; transition:all .15s; }
.pin-dot.filled { background:#00694c; transform:scale(1.15); }
.pin-dot.error { background:#dc2626; }
.numpad { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; max-width:240px; margin:0 auto; }
.num-btn { padding:16px; border-radius:12px; border:1.5px solid #bccac1; background:#f7f9fb; font-size:20px; font-weight:600; color:#191c1e; cursor:pointer; transition:all .1s; }
.num-btn:hover { background:#eceef0; border-color:#00694c; }
.num-btn:active { transform:scale(0.93); }
.num-btn.del { font-size:14px; color:#6d7a73; }
.num-btn.zero { grid-column:2; }
.admin-card { background:#fff; border-radius:20px; padding:40px; box-shadow:0 24px 60px rgba(0,0,0,0.25); max-width:400px; margin:0 auto; }
.form-input { width:100%; border:1.5px solid #bccac1; border-radius:10px; padding:11px 14px 11px 42px; font-size:14px; background:#f7f9fb; color:#191c1e; outline:none; transition:all .15s; box-sizing:border-box; }
.form-input:focus { border-color:#00694c; background:#fff; box-shadow:0 0 0 3px #00694c18; }
.form-input.error-field { border-color:#dc2626; }
.input-wrap { position:relative; }
.input-icon { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#6d7a73; font-size:20px; }
.eye-btn { position:absolute; right:12px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#6d7a73; padding:0; display:flex; align-items:center; }
.login-btn { width:100%; padding:13px; background:#00694c; color:white; border:none; border-radius:10px; font-size:15px; font-weight:700; cursor:pointer; transition:all .15s; display:flex; align-items:center; justify-content:center; gap:8px; }
.login-btn:hover { background:#00513a; }
.login-btn:disabled { background:#bccac1; cursor:not-allowed; }
.back-btn { display:flex; align-items:center; gap:6px; color:#3d4943; background:none; border:none; cursor:pointer; font-size:14px; font-weight:500; padding:0; margin-bottom:20px; }
.back-btn:hover { color:#00694c; }
@keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
.shake { animation:shake .35s ease; }
`;

const staffList = [
  { id: 1, name: 'Minh Tran',   role: 'Staff', pin: '1234', color: '#1d6fb8' },
  { id: 2, name: 'Lan Pham',    role: 'Staff', pin: '5678', color: '#6941c6' },
  { id: 3, name: 'Hung Le',     role: 'Staff', pin: '2468', color: '#D97706' },
  { id: 4, name: 'Thao Nguyen', role: 'Staff', pin: '1357', color: '#dc2626' },
  { id: 5, name: 'Bao Tran',    role: 'Staff', pin: '9999', color: '#059669' },
];

const admins = [
  { username: 'alex.nguyen', password: 'admin123', name: 'Alex Nguyen' },
  { username: 'admin',       password: 'admin',    name: 'Admin' },
];

function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase();
}

export default function LoginPage({ onNav }: Props) {
  const router = useRouter();
  const [screen, setScreen] = useState<'select' | 'pin' | 'admin'>('select');
  const [currentStaff, setCurrentStaff] = useState<typeof staffList[0] | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [shakePin, setShakePin] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [adminError, setAdminError] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminSuccess, setAdminSuccess] = useState(false);
  const [shakeAdmin, setShakeAdmin] = useState(false);

  const selectStaff = (s: typeof staffList[0]) => {
    setCurrentStaff(s);
    setPinInput('');
    setPinError(false);
    setScreen('pin');
  };

  const pressNum = (n: string, currentPin?: string) => {
    const pin = currentPin !== undefined ? currentPin : pinInput;
    if (pin.length >= 4) return;
    const next = pin + n;
    setPinInput(next);
    if (next.length === 4) {
      setTimeout(() => checkPin(next), 120);
    }
  };

  const pressDelete = () => {
    setPinInput(p => p.slice(0, -1));
    setPinError(false);
  };

  const checkPin = (pin: string) => {
    if (pin === currentStaff?.pin) {
      setTimeout(() => {
        alert(`Welcome ${currentStaff.name}! Redirecting to POS...`);
        setPinInput('');
        setPinError(false);
        setScreen('select');
      }, 600);
    } else {
      setPinError(true);
      setShakePin(true);
      setTimeout(() => {
        setShakePin(false);
        setPinInput('');
        setPinError(false);
      }, 400);
    }
  };

  const handleAdminLogin = () => {
    if (!adminUser || !adminPass) return;
    setAdminLoading(true);
    setAdminError(false);
    setTimeout(() => {
      const account = admins.find(a => a.username === adminUser && a.password === adminPass);
      setAdminLoading(false);
      if (account) {
        setAdminSuccess(true);
        setTimeout(() => {
          alert(`Welcome ${account.name}! Redirecting to Admin Dashboard...`);
          setAdminSuccess(false);
          onNav('dashboard');
        }, 700);
      } else {
        setAdminError(true);
        setShakeAdmin(true);
        setTimeout(() => setShakeAdmin(false), 400);
      }
    }, 1000);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (screen === 'pin') {
        if (e.key >= '0' && e.key <= '9') {
          setPinInput(prev => {
            if (prev.length >= 4) return prev;
            const next = prev + e.key;
            if (next.length === 4) setTimeout(() => checkPin(next), 120);
            return next;
          });
        }
        if (e.key === 'Backspace') pressDelete();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, currentStaff]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (screen === 'admin' && e.key === 'Enter') handleAdminLogin();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, adminUser, adminPass]);

  return (
    <div style={{ fontFamily: 'Inter,sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#f2f4f6' }}>
      <style>{pageCSS}</style>

      {/* Screen 1: Select Staff */}
      {screen === 'select' && (
        <div style={{ width: '100%', maxWidth: '680px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ width: '52px', height: '52px', background: '#00694c18', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#00694c' }}>store</span>
            </div>
            <h1 style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: '26px', fontWeight: 700, color: '#191c1e', margin: '0 0 6px' }}>RetailPro</h1>
            <p style={{ fontSize: '14px', color: '#6d7a73', margin: 0 }}>Who&apos;s working today?</p>
          </div>

          <div className="staff-grid">
            {staffList.map(s => (
              <div key={s.id} className="staff-card" onClick={() => selectStaff(s)}>
                <div className="staff-avatar" style={{ background: s.color }}>{initials(s.name)}</div>
                <div className="staff-name">{s.name}</div>
                <div className="staff-role">{s.role}</div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <button
              onClick={() => setScreen('admin')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '99px', border: '1.5px solid #bccac1', background: '#fff', color: '#3d4943', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all .15s' }}
              onMouseOver={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#00694c'; (e.currentTarget as HTMLButtonElement).style.color = '#00694c'; }}
              onMouseOut={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#bccac1'; (e.currentTarget as HTMLButtonElement).style.color = '#3d4943'; }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>admin_panel_settings</span>
              Admin Login
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#6d7a73', marginTop: '32px' }}>
            © 2024 RetailPro Management System
          </p>
        </div>
      )}

      {/* Screen 2: PIN Entry */}
      {screen === 'pin' && (
        <div style={{ width: '100%', maxWidth: '680px' }}>
          <button className="back-btn" onClick={() => setScreen('select')}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span> Back
          </button>
          <div className={`pin-card${shakePin ? ' shake' : ''}`}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700, color: 'white', margin: '0 auto 12px', background: currentStaff?.color }}>
              {currentStaff ? initials(currentStaff.name) : ''}
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#191c1e', margin: '0 0 4px' }}>{currentStaff?.name}</h2>
            <p style={{ fontSize: '13px', color: '#6d7a73', margin: '0 0 4px' }}>{currentStaff?.role}</p>
            <p style={{ fontSize: '13px', color: '#6d7a73', margin: 0 }}>Enter your PIN</p>
            <div className="pin-dots">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`pin-dot${pinInput.length > i ? ' filled' : ''}${pinError ? ' error' : ''}`} />
              ))}
            </div>
            {pinError && <p style={{ color: '#dc2626', fontSize: '13px', margin: '0 0 12px' }}>Incorrect PIN. Try again.</p>}
            <div className="numpad">
              {['1','2','3','4','5','6','7','8','9'].map(n => (
                <button key={n} className="num-btn" onClick={() => pressNum(n)}>{n}</button>
              ))}
              <button className="num-btn zero" onClick={() => pressNum('0')}>0</button>
              <button className="num-btn del" onClick={pressDelete}>
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>backspace</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screen 3: Admin Login */}
      {screen === 'admin' && (
        <div style={{ width: '100%', maxWidth: '680px' }}>
          <button className="back-btn" onClick={() => setScreen('select')}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span> Back
          </button>
          <div className={`admin-card${shakeAdmin ? ' shake' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
              <div style={{ width: '40px', height: '40px', background: '#00694c', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: 'white', fontSize: '22px' }}>admin_panel_settings</span>
              </div>
              <div>
                <p style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: '16px', fontWeight: 700, color: '#00694c', margin: 0 }}>Admin Login</p>
                <p style={{ fontSize: '11px', color: '#6d7a73', margin: 0 }}>Full system access</p>
              </div>
            </div>

            {adminError && (
              <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span className="material-symbols-outlined" style={{ color: '#dc2626', fontSize: '18px' }}>error</span>
                <span style={{ fontSize: '13px', color: '#991b1b' }}>Invalid username or password</span>
              </div>
            )}

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#3d4943', display: 'block', marginBottom: '5px' }}>Username</label>
              <div className="input-wrap">
                <span className="material-symbols-outlined input-icon">person</span>
                <input
                  className={`form-input${adminError ? ' error-field' : ''}`}
                  type="text"
                  placeholder="Enter username"
                  value={adminUser}
                  onChange={e => setAdminUser(e.target.value)}
                />
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#3d4943', display: 'block', marginBottom: '5px' }}>Password</label>
              <div className="input-wrap">
                <span className="material-symbols-outlined input-icon">lock</span>
                <input
                  className={`form-input${adminError ? ' error-field' : ''}`}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter password"
                  style={{ paddingRight: '44px' }}
                  value={adminPass}
                  onChange={e => setAdminPass(e.target.value)}
                />
                <button className="eye-btn" type="button" onClick={() => setShowPass(v => !v)}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{showPass ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <button
              className="login-btn"
              disabled={adminLoading}
              onClick={handleAdminLogin}
              style={adminSuccess ? { background: '#059669' } : undefined}
            >
              <span>{adminLoading ? 'Signing in...' : adminSuccess ? 'Success!' : 'Sign In'}</span>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                {adminLoading ? 'autorenew' : adminSuccess ? 'check_circle' : 'arrow_forward'}
              </span>
            </button>

            <p style={{ textAlign: 'center', fontSize: '12px', color: '#6d7a73', marginTop: '16px' }}>
              Staff?{' '}
              <button onClick={() => setScreen('select')} style={{ background: 'none', border: 'none', color: '#00694c', fontWeight: 600, cursor: 'pointer', fontSize: '12px' }}>
                Select your name instead
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
