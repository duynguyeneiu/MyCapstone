'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { globalStyle, type Page } from './_lib/types';
import { C } from './_lib/types';
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

export default function AdminPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [activePage, setActivePage] = useState<Page>('dashboard');
  // RetailPro internal login (for staff PIN / extra security layer inside admin)
  const [rpLoggedIn, setRpLoggedIn] = useState(false);

  // Redirect non-admin, non-staff users back to homepage
  useEffect(() => {
    if (user === null) {
      // Not logged in at all
      router.push('/');
    } else if (user.role === 'client') {
      router.push('/');
    } else if (user.role === 'staff') {
      // Staff goes straight to POS — no full dashboard
      setActivePage('pos');
      setRpLoggedIn(true);
    } else if (user.role === 'admin') {
      setRpLoggedIn(true);
      setActivePage('dashboard');
    }
  }, [user, router]);

  // Loading / redirect state
  if (!user || user.role === 'client') return null;

  // ── STAFF: POS only ──────────────────────────────────────────
  if (user.role === 'staff') {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <style>{globalStyle}</style>
        {/* Slim staff topbar */}
        <div style={{
          height: 48, background: C.primary, display: 'flex', alignItems: 'center',
          padding: '0 20px', gap: 12, flexShrink: 0,
        }}>
          <span style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontWeight: 700, color: '#fff', fontSize: 16, flex: 1 }}>
            🏪 Happy Market — POS Terminal
          </span>
          <span style={{ fontSize: 12, color: '#b8e0cc' }}>
            Staff: {user.name}
          </span>
          <button
            onClick={() => { logout(); router.push('/'); }}
            style={{ padding: '5px 14px', borderRadius: 8, background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.25)', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
          >
            Sign Out
          </button>
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <POSPage />
        </div>
      </div>
    );
  }

  // Wrapper: convert string → Page type
  const handleNav = (p: string) => setActivePage(p as Page);

  // ── ADMIN: Full RetailPro ─────────────────────────────────────
  if (!rpLoggedIn) {
    return (
      <>
        <style>{globalStyle}</style>
        <LoginPage onNav={(p) => { setRpLoggedIn(true); setActivePage(p as Page); }} />
      </>
    );
  }

  return (
    <>
      <style>{globalStyle}</style>
      {activePage === 'pos'        && <POSPage />}
      {activePage === 'dashboard'  && <DashboardPage activePage={activePage} onNav={handleNav} />}
      {activePage === 'products'   && <AdminProductsPage activePage={activePage} onNav={handleNav} />}
      {activePage === 'categories' && <AdminCategoriesPage activePage={activePage} onNav={handleNav} />}
      {activePage === 'orders'     && <AdminOrdersPage activePage={activePage} onNav={handleNav} />}
      {activePage === 'inventory'  && <InventoryPage activePage={activePage} onNav={handleNav} />}
      {activePage === 'users'      && <AdminUsersPage activePage={activePage} onNav={handleNav} />}
      {activePage === 'promotions' && <PromotionsPage activePage={activePage} onNav={handleNav} />}
      {activePage === 'settings'   && <AdminSettingsPage activePage={activePage} onNav={handleNav} />}
    </>
  );
}
