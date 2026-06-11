'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { globalStyle, NAV_ITEMS, type Page } from './_lib/types';
import { C } from './_lib/types';
import AdminSidebar from './_components/layout/AdminSidebar';
import AdminHeader from './_components/layout/AdminHeader';
import LoginPage from './_components/pages/LoginPage';
import DashboardPage from './_components/pages/DashboardPage';
import POSPage from './_components/pages/POSPage';
import AdminProductsPage from './_components/pages/AdminProductsPage';
import AdminCategoriesPage from './_components/pages/AdminCategoriesPage';
import AdminOrdersPage from './_components/pages/AdminOrdersPage';
import InventoryPage from './_components/pages/InventoryPage';
import AdminUsersPage from './_components/pages/AdminUsersPage';
import PromotionsPage from './_components/pages/PromotionsPage';
import AdminSettingsPage from './_components/pages/AdminSettingsPage';
import { useAuth } from '../context/AuthContext';

/* Shared styles injected once for all admin pages */
const sharedAdminCSS = `
  .search-bar { background:#fff8e6; border:1.5px solid #fcd97a; border-radius:999px; display:flex; align-items:center; padding:8px 16px; gap:8px; }
  .search-bar:focus-within { border-color:#f59e0b; box-shadow:0 0 0 3px #f59e0b22; }
  .search-bar input { background:transparent; border:none; outline:none; width:100%; font-size:14px; }
  .stat-card { transition:transform .18s ease; }
  .stat-card:hover { transform:translateY(-2px); }
  .btn-primary { background:linear-gradient(135deg,#00694c 0%,#00a86b 100%); color:#fff; transition:all .15s; box-shadow:0 2px 8px #00694c33; }
  .btn-primary:hover { box-shadow:0 4px 14px #00694c55; }
  .btn-amber { background:linear-gradient(135deg,#f59e0b,#d97706); color:#fff; border:none; cursor:pointer; transition:all .15s; box-shadow:0 2px 8px #f59e0b33; }
  .btn-amber:hover { box-shadow:0 4px 14px #f59e0b55; }
  tbody tr:hover { background:#f4fbf7 !important; }
  .brand-dot { display:inline-block; width:10px; height:10px; border-radius:50%; background:linear-gradient(135deg,#f59e0b,#00694c); margin-right:6px; vertical-align:middle; }
  .filter-select { border:1.5px solid #d4f0e4; border-radius:8px; padding:8px 12px; font-size:14px; background:#f4fbf7; color:#191c1e; outline:none; cursor:pointer; }
  .filter-select:focus { border-color:#00694c; box-shadow:0 0 0 3px #00694c1a; }
  .modal-input { width:100%; border:1.5px solid #bbe8d4; border-radius:8px; padding:9px 12px; font-size:14px; background:#f4fbf7; color:#191c1e; outline:none; }
  .modal-input:focus { border-color:#00694c; background:#fff; box-shadow:0 0 0 3px #00694c1a; }
  .tab-btn { padding:8px 18px; border-radius:999px; border:1.5px solid #d4f0e4; background:#fff; font-size:13px; font-weight:500; color:#3d4943; cursor:pointer; transition:all .15s; }
  .tab-btn.tab-active { background:linear-gradient(135deg,#00694c,#00a86b); color:#fff; border-color:transparent; box-shadow:0 2px 8px #00694c33; }
  .fab { position:fixed; bottom:32px; right:32px; width:56px; height:56px; border-radius:50%; background:linear-gradient(135deg,#f59e0b,#d97706); color:#fff; border:none; cursor:pointer; font-size:28px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 16px #f59e0b55; transition:all .2s; z-index:50; }
  .fab:hover { transform:scale(1.08); box-shadow:0 6px 24px #f59e0b66; }
  /* Settings-specific */
  .setting-nav-btn { display:flex; align-items:center; gap:10px; padding:10px 16px; border-radius:8px; font-size:14px; font-weight:500; color:#3d4943; cursor:pointer; transition:all .15s; width:100%; background:none; border:none; text-align:left; }
  .setting-nav-btn:hover { background:#e8f5ee; }
  .setting-nav-btn.snav-active { background:#fff3d6; color:#00694c; font-weight:700; border-left:3px solid #f59e0b; }
  .save-btn { padding:9px 20px; background:linear-gradient(135deg,#00694c 0%,#00a86b 100%); color:white; border-radius:8px; font-size:14px; font-weight:700; border:none; cursor:pointer; box-shadow:0 2px 8px #00694c33; }
  .save-btn:hover { box-shadow:0 4px 14px #00694c55; }
  .cancel-btn { padding:9px 20px; border:1.5px solid #bbe8d4; color:#3d4943; border-radius:8px; font-size:14px; cursor:pointer; background:transparent; }
  .cancel-btn:hover { background:#e8f5ee; }
  .form-input { width:100%; border:1.5px solid #bbe8d4; border-radius:8px; padding:9px 12px; font-size:14px; background:#f4fbf7; color:#191c1e; outline:none; }
  .form-input:focus { border-color:#00694c; background:#fff; box-shadow:0 0 0 3px #00694c1a; }
  .section-card { background:#fff; border:1px solid #d4f0e4; border-radius:12px; padding:24px; margin-bottom:16px; }
  .section-card h3 { font-size:16px; font-weight:700; color:#191c1e; margin-bottom:4px; }
  .section-card p.desc { font-size:13px; color:#3d4943; margin-bottom:20px; }
  .field-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; }
  .field-row.full { grid-template-columns:1fr; }
  .field-label { font-size:12px; font-weight:600; color:#3d4943; margin-bottom:5px; display:block; }
  .divider { border:none; border-top:1px solid #d4f0e4; margin:20px 0; }
  .toggle-row { display:flex; align-items:center; justify-content:space-between; padding:14px 0; border-bottom:1px solid #edf7f2; }
  .toggle-row:last-child { border-bottom:none; }
  .danger-btn { padding:9px 20px; background:#fee2e2; color:#991b1b; border-radius:8px; font-size:14px; font-weight:700; border:1px solid #fca5a5; cursor:pointer; }
  .danger-btn:hover { background:#fca5a5; }
  .toggle { position:relative; width:44px; height:24px; cursor:pointer; display:inline-block; }
  .toggle input { opacity:0; width:0; height:0; position:absolute; }
  .toggle-track { position:absolute; inset:0; background:#bbe8d4; border-radius:99px; transition:.2s; }
  .toggle input:checked + .toggle-track { background:#00694c; }
  .toggle-thumb { position:absolute; top:3px; left:3px; width:18px; height:18px; background:white; border-radius:50%; transition:.2s; pointer-events:none; }
  .toggle input:checked ~ .toggle-thumb { transform:translateX(20px); }
`;

export default function AdminPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [rpLoggedIn, setRpLoggedIn] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user === null) {
      router.push('/');
    } else if (user.role === 'client') {
      router.push('/');
    } else if (user.role === 'staff') {
      setActivePage('pos');
      setRpLoggedIn(true);
    } else if (user.role === 'admin') {
      setRpLoggedIn(true);
      setActivePage('dashboard');
    }
  }, [user, router]);

  if (!user || user.role === 'client') return null;

  const handleNav = (p: string) => { setActivePage(p as Page); setSearch(''); };
  const handleLogout = () => { logout(); router.push('/'); };

  /* ── STAFF: POS only ──────────────────────────────────────────────────── */
  if (user.role === 'staff') {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <style>{globalStyle}</style>
        <div style={{ height: 48, background: C.primary, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12, flexShrink: 0 }}>
          <span style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, color: '#fff', fontSize: 16, flex: 1 }}>
            🏪 Happy Market — POS Terminal
          </span>
          <span style={{ fontSize: 12, color: '#b8e0cc' }}>Staff: {user.name}</span>
          <button onClick={handleLogout}
            style={{ padding: '5px 14px', borderRadius: 8, background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.25)', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            Sign Out
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}><POSPage /></div>
      </div>
    );
  }

  /* ── ADMIN: Login gate ────────────────────────────────────────────────── */
  if (!rpLoggedIn) {
    return (
      <>
        <style>{globalStyle}</style>
        <LoginPage onNav={(p) => { setRpLoggedIn(true); setActivePage(p as Page); }} />
      </>
    );
  }

  /* ── ADMIN: Full shell ────────────────────────────────────────────────── */
  const pageTitle = NAV_ITEMS.find(n => n.page === activePage)?.label ?? 'Dashboard';

  /* POS gets full-screen treatment (no sidebar/header) */
  if (activePage === 'pos') {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <style>{globalStyle}</style>
        <div style={{ height: 48, background: C.primary, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12, flexShrink: 0 }}>
          <span style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, color: '#fff', fontSize: 16, flex: 1 }}>
            🏪 Happy Market — POS
          </span>
          <button onClick={() => setActivePage('dashboard')}
            style={{ padding: '5px 14px', borderRadius: 8, background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.25)', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            ← Back to Admin
          </button>
          <button onClick={handleLogout}
            style={{ padding: '5px 14px', borderRadius: 8, background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.25)', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
            Sign Out
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}><POSPage /></div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      <style>{globalStyle + sharedAdminCSS}</style>

      {/* Shared sidebar — rendered once for all pages */}
      <AdminSidebar
        activePage={activePage}
        onNav={p => setActivePage(p)}
        onGoHome={() => router.push('/')}
        adminName={user.name}
        onLogout={handleLogout}
      />

      {/* Right column: header + scrollable content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AdminHeader
          title={pageTitle} onNav={handleNav} userName={user.name}
          searchValue={['dashboard','products','categories','orders','inventory','users','promotions'].includes(activePage) ? search : undefined}
          onSearch={['dashboard','products','categories','orders','inventory','users','promotions'].includes(activePage) ? setSearch : undefined}
        />
        <main style={{ flex: 1, overflowY: 'auto', background: '#f7fbf9' }}>
          {activePage === 'dashboard'  && <DashboardPage  onNav={handleNav} search={search} />}
          {activePage === 'products'   && <AdminProductsPage  onNav={handleNav} search={search} />}
          {activePage === 'categories' && <AdminCategoriesPage search={search} />}
          {activePage === 'orders'     && <AdminOrdersPage    search={search} />}
          {activePage === 'inventory'  && <InventoryPage      search={search} />}
          {activePage === 'users'      && <AdminUsersPage     search={search} />}
          {activePage === 'promotions' && <PromotionsPage     search={search} />}
          {activePage === 'settings'   && <AdminSettingsPage  onNav={handleNav} />}
        </main>
      </div>
    </div>
  );
}
