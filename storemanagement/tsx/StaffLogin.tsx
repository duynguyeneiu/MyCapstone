import { useState, useEffect, useCallback } from 'react';

const staffList = [
  { id: 1, name: 'Minh Tran',   role: 'Staff', pin: '1234', color: '#1d6fb8' },
  { id: 2, name: 'Lan Pham',    role: 'Staff', pin: '5678', color: '#6941c6' },
  { id: 3, name: 'Hung Le',     role: 'Staff', pin: '2468', color: '#D97706' },
  { id: 4, name: 'Thao Nguyen', role: 'Staff', pin: '1357', color: '#dc2626' },
  { id: 5, name: 'Bao Tran',    role: 'Staff', pin: '9999', color: '#059669' },
];

const admins = [
  { username: 'alex.nguyen', password: 'admin123', name: 'Alex Nguyen' },
  { username: 'admin',       password: 'admin',    name: 'Admin'       },
];

function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase();
}

type Screen = 'select' | 'pin' | 'admin';
type PinState = 'idle' | 'error' | 'success';

export default function StaffLogin() {
  const [screen, setScreen] = useState<Screen>('select');
  const [selectedStaff, setSelectedStaff] = useState<typeof staffList[0] | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinState, setPinState] = useState<PinState>('idle');
  const [shake, setShake] = useState(false);

  // Admin login
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [adminError, setAdminError] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminSuccess, setAdminSuccess] = useState(false);
  const [adminErrFields, setAdminErrFields] = useState(false);

  function selectStaff(staff: typeof staffList[0]) {
    setSelectedStaff(staff);
    setPinInput('');
    setPinState('idle');
    setScreen('pin');
  }

  const checkPin = useCallback((pin: string, staff: typeof staffList[0]) => {
    if (pin === staff.pin) {
      setPinState('success');
      setTimeout(() => {
        alert(`Welcome ${staff.name}! Redirecting to POS...`);
        setPinInput('');
        setPinState('idle');
        setScreen('select');
      }, 600);
    } else {
      setPinState('error');
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setPinInput('');
        setPinState('idle');
      }, 400);
    }
  }, []);

  function pressNum(n: string) {
    if (pinInput.length >= 4 || !selectedStaff) return;
    const next = pinInput + n;
    setPinInput(next);
    if (next.length === 4) setTimeout(() => checkPin(next, selectedStaff), 120);
  }

  function pressDelete() {
    setPinInput(p => p.slice(0, -1));
    setPinState('idle');
  }

  // Keyboard support
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (screen === 'pin') {
        if (e.key >= '0' && e.key <= '9') pressNum(e.key);
        if (e.key === 'Backspace') pressDelete();
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, pinInput, selectedStaff]);

  function handleAdminLogin() {
    if (!adminUser || !adminPass) return;
    setAdminLoading(true);
    setAdminError(false);
    setAdminErrFields(false);
    setTimeout(() => {
      setAdminLoading(false);
      const account = admins.find(a => a.username === adminUser && a.password === adminPass);
      if (account) {
        setAdminSuccess(true);
        setTimeout(() => {
          alert(`Welcome ${account.name}! Redirecting to Admin Dashboard...`);
          setAdminSuccess(false);
        }, 700);
      } else {
        setAdminError(true);
        setAdminErrFields(true);
        setShake(true);
        setTimeout(() => setShake(false), 400);
      }
    }, 1000);
  }

  // Dot rendering
  function renderDot(i: number) {
    const filled = i < pinInput.length;
    let bg = '#eceef0';
    if (filled && pinState === 'success') bg = '#059669';
    else if (filled || (pinState === 'error' && i < 4)) bg = pinState === 'error' ? '#dc2626' : '#00694c';
    return (
      <div key={i} style={{
        width: 14, height: 14, borderRadius: '50%',
        background: bg,
        transform: filled ? 'scale(1.15)' : 'scale(1)',
        transition: 'all .15s',
      }} />
    );
  }

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif", margin: 0, background: '#f2f4f6',
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <style>{`
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
        .shake-anim { animation: shake .35s ease; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .staff-card { background:#fff; border:1.5px solid #e0e3e5; border-radius:16px; padding:20px 16px; text-align:center; cursor:pointer; transition:all .15s; box-shadow:0 2px 8px rgba(0,0,0,0.06); }
        .staff-card:hover { background:#f0faf5; border-color:#00694c; transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,105,76,0.12); }
        .num-btn { padding:16px; border-radius:12px; border:1.5px solid #bccac1; background:#f7f9fb; font-size:20px; font-weight:600; color:#191c1e; cursor:pointer; transition:all .1s; }
        .num-btn:hover { background:#eceef0; border-color:#00694c; }
        .num-btn:active { transform:scale(0.93); }
        .login-input { width:100%; border:1.5px solid #bccac1; border-radius:10px; padding:11px 14px 11px 42px; font-size:14px; background:#f7f9fb; color:#191c1e; outline:none; transition:all .15s; box-sizing:border-box; }
        .login-input:focus { border-color:#00694c; background:#fff; box-shadow:0 0 0 3px #00694c18; }
        .login-input.err { border-color:#dc2626; }
      `}</style>

      {/* Screen 1: Select Staff */}
      {screen === 'select' && (
        <div style={{ width: '100%', maxWidth: 680 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 52, height: 52, background: '#00694c18', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#00694c' }}>store</span>
            </div>
            <h1 style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 26, fontWeight: 700, color: '#191c1e', margin: '0 0 6px' }}>RetailPro</h1>
            <p style={{ fontSize: 14, color: '#6d7a73', margin: 0 }}>Who's working today?</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 12, marginTop: 20 }}>
            {staffList.map(s => (
              <div key={s.id} className="staff-card" onClick={() => selectStaff(s)}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: 'white', margin: '0 auto 10px' }}>
                  {initials(s.name)}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#191c1e' }}>{s.name}</div>
                <div style={{ fontSize: 11, color: '#6d7a73', marginTop: 2 }}>{s.role}</div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button onClick={() => setScreen('admin')} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 20px', borderRadius: 99, border: '1.5px solid #bccac1',
              background: '#fff', color: '#3d4943', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>admin_panel_settings</span>
              Admin Login
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#6d7a73', marginTop: 32 }}>
            © 2024 RetailPro Management System
          </p>
        </div>
      )}

      {/* Screen 2: PIN Entry */}
      {screen === 'pin' && selectedStaff && (
        <div style={{ width: '100%', maxWidth: 680 }}>
          <button onClick={() => setScreen('select')} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#3d4943', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, marginBottom: 20, padding: 0 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span> Back
          </button>

          <div className={shake ? 'shake-anim' : ''} style={{ background: '#fff', borderRadius: 20, padding: '36px 32px', textAlign: 'center', boxShadow: '0 24px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: selectedStaff.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: 'white', margin: '0 auto 12px' }}>
              {initials(selectedStaff.name)}
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#191c1e', margin: '0 0 4px' }}>{selectedStaff.name}</h2>
            <p style={{ fontSize: 13, color: '#6d7a73', margin: '0 0 4px' }}>{selectedStaff.role}</p>
            <p style={{ fontSize: 13, color: '#6d7a73', margin: 0 }}>Enter your PIN</p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, margin: '24px 0 20px' }}>
              {[0, 1, 2, 3].map(i => renderDot(i))}
            </div>

            {pinState === 'error' && (
              <p style={{ color: '#dc2626', fontSize: 13, margin: '0 0 12px' }}>Incorrect PIN. Try again.</p>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, maxWidth: 240, margin: '0 auto' }}>
              {['1','2','3','4','5','6','7','8','9'].map(n => (
                <button key={n} className="num-btn" onClick={() => pressNum(n)}>{n}</button>
              ))}
              <div />
              <button className="num-btn" onClick={() => pressNum('0')}>0</button>
              <button className="num-btn" onClick={pressDelete} style={{ fontSize: 14, color: '#6d7a73', padding: 16 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>backspace</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Screen 3: Admin Login */}
      {screen === 'admin' && (
        <div style={{ width: '100%', maxWidth: 680 }}>
          <button onClick={() => setScreen('select')} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#3d4943', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, marginBottom: 20, padding: 0 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span> Back
          </button>

          <div className={shake ? 'shake-anim' : ''} style={{ background: '#fff', borderRadius: 20, padding: 40, boxShadow: '0 24px 60px rgba(0,0,0,0.25)', maxWidth: 400, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <div style={{ width: 40, height: 40, background: '#00694c', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: 'white', fontSize: 22 }}>admin_panel_settings</span>
              </div>
              <div>
                <p style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: '#00694c', margin: 0 }}>Admin Login</p>
                <p style={{ fontSize: 11, color: '#6d7a73', margin: 0 }}>Full system access</p>
              </div>
            </div>

            {adminError && (
              <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span className="material-symbols-outlined" style={{ color: '#dc2626', fontSize: 18 }}>error</span>
                <span style={{ fontSize: 13, color: '#991b1b' }}>Invalid username or password</span>
              </div>
            )}

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#3d4943', display: 'block', marginBottom: 5 }}>Username</label>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6d7a73', fontSize: 20 }}>person</span>
                <input className={`login-input${adminErrFields ? ' err' : ''}`} type="text" placeholder="Enter username" value={adminUser} onChange={e => setAdminUser(e.target.value)} />
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#3d4943', display: 'block', marginBottom: 5 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <span className="material-symbols-outlined" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6d7a73', fontSize: 20 }}>lock</span>
                <input className={`login-input${adminErrFields ? ' err' : ''}`} type={showPass ? 'text' : 'password'} placeholder="Enter password" value={adminPass} onChange={e => setAdminPass(e.target.value)} style={{ paddingRight: 44 }}
                  onKeyDown={e => e.key === 'Enter' && handleAdminLogin()} />
                <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6d7a73', display: 'flex', alignItems: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{showPass ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <button
              onClick={handleAdminLogin}
              disabled={adminLoading || !adminUser || !adminPass}
              style={{
                width: '100%', padding: 13,
                background: adminSuccess ? '#059669' : adminLoading ? '#bccac1' : '#00694c',
                color: 'white', border: 'none', borderRadius: 10,
                fontSize: 15, fontWeight: 700, cursor: adminLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all .15s',
              }}
            >
              <span>{adminSuccess ? 'Success!' : adminLoading ? 'Signing in...' : 'Sign In'}</span>
              <span className={`material-symbols-outlined${adminLoading ? '' : ''}`} style={{ fontSize: 20, ...(adminLoading ? { animation: 'spin .8s linear infinite', display: 'inline-block' } : {}) }}>
                {adminSuccess ? 'check_circle' : adminLoading ? 'autorenew' : 'arrow_forward'}
              </span>
            </button>

            <p style={{ textAlign: 'center', fontSize: 12, color: '#6d7a73', marginTop: 16 }}>
              Staff?{' '}
              <button onClick={() => setScreen('select')} style={{ background: 'none', border: 'none', color: '#00694c', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>
                Select your name instead
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
