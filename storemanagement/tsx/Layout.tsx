import React, { useState } from 'react';

export type NavPage = 'dashboard' | 'products' | 'categories' | 'orders' | 'inventory' | 'promotions' | 'users' | 'pos' | 'settings';

interface LayoutProps {
  children: React.ReactNode;
  activePage: NavPage;
  onNavigate?: (page: NavPage) => void;
  title: string;
  headerRight?: React.ReactNode;
  searchPlaceholder?: string;
  onSearch?: (q: string) => void;
}

const navItems: { id: NavPage; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'products', label: 'Products', icon: 'shopping_bag' },
  { id: 'categories', label: 'Categories', icon: 'category' },
  { id: 'orders', label: 'Orders', icon: 'receipt_long' },
  { id: 'inventory', label: 'Inventory', icon: 'inventory_2' },
  { id: 'promotions', label: 'Promotions', icon: 'campaign' },
  { id: 'users', label: 'Users', icon: 'group' },
  { id: 'pos', label: 'POS', icon: 'point_of_sale' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

export const Sidebar: React.FC<{ activePage: NavPage; onNavigate?: (page: NavPage) => void }> = ({ activePage, onNavigate }) => (
  <aside className="h-screen w-64 fixed left-0 top-0 z-40 flex flex-col overflow-y-auto"
    style={{
      borderRight: '2px solid #ffe08a',
      background: 'linear-gradient(180deg, #f4fbf7 0%, #fffdf5 100%)',
      padding: '16px 8px',
    }}>
    <div style={{ marginBottom: '48px', padding: '0 16px' }}>
      <h1 style={{ fontSize: '20px', lineHeight: '28px', fontWeight: '700', color: '#00694c', display: 'flex', alignItems: 'center', fontFamily: 'Hanken Grotesk, sans-serif' }}>
        <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #00694c)', marginRight: 6, verticalAlign: 'middle' }} />
        RetailPro
      </h1>
      <p style={{ fontSize: '14px', lineHeight: '16px', letterSpacing: '0.01em', fontWeight: '500', color: '#3d4943' }}>Management System</p>
    </div>
    <nav style={{ flex: 1 }}>
      {navItems.map(item => {
        const isActive = activePage === item.id;
        return (
          <a
            key={item.id}
            href={`${item.id}.html`}
            onClick={onNavigate ? (e) => { e.preventDefault(); onNavigate(item.id); } : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              borderRadius: 8,
              marginBottom: 2,
              textDecoration: 'none',
              transition: 'background 0.15s',
              ...(isActive ? {
                background: 'linear-gradient(90deg, #fff3d6 0%, rgba(253,230,138,0.27) 100%)',
                borderLeft: '3px solid #f59e0b',
                color: '#00694c',
                fontWeight: 700,
              } : {
                color: '#3d4943',
              }),
            }}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span style={{ fontSize: '14px', lineHeight: '16px', letterSpacing: '0.01em', fontWeight: isActive ? 700 : 500 }}>{item.label}</span>
          </a>
        );
      })}
    </nav>
    <div style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid #ffe08a' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="material-symbols-outlined" style={{ color: '#3d4943' }}>help_outline</span>
        <div>
          <p style={{ fontWeight: 700, color: '#191c1e', fontSize: 13 }}>Need Help?</p>
          <p style={{ color: '#3d4943', fontSize: 11 }}>Check our documentation</p>
        </div>
      </div>
    </div>
  </aside>
);

export const TopBar: React.FC<{ title: string; headerRight?: React.ReactNode; searchPlaceholder?: string; onSearch?: (q: string) => void }> = ({
  title, headerRight, searchPlaceholder, onSearch
}) => (
  <header className="sticky top-0 z-30 flex justify-between items-center"
    style={{
      padding: '8px 32px',
      background: 'linear-gradient(90deg, #f7fbf9 0%, #fffdf5 100%)',
      borderBottom: '1.5px solid #ffe08a',
    }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <h2 style={{ color: '#00694c', fontWeight: 700, fontSize: 24 }}>{title}</h2>
      {onSearch && (
        <div className="hidden lg:flex" style={{ background: '#fff8e6', border: '1.5px solid #fcd97a', borderRadius: 999, display: 'flex', alignItems: 'center', padding: '8px 16px', gap: 8, minWidth: 280 }}>
          <span className="material-symbols-outlined" style={{ color: '#b47b10', fontSize: 20 }}>search</span>
          <input
            placeholder={searchPlaceholder || 'Search...'}
            onChange={e => onSearch(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', fontSize: 14 }}
          />
        </div>
      )}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {headerRight}
      <button className="material-symbols-outlined" style={{ color: '#3d4943', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '50%', padding: 8 }}>notifications</button>
      <button className="material-symbols-outlined" style={{ color: '#3d4943', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '50%', padding: 8 }}>help_outline</button>
      <div style={{ height: 32, width: 1, margin: '0 8px', background: '#ffe08a' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#00694c,#f59e0b)' }}>
          <span className="material-symbols-outlined" style={{ color: 'white', fontSize: 16 }}>person</span>
        </div>
        <div>
          <p style={{ fontWeight: 700, color: '#191c1e', fontSize: 13, lineHeight: 1 }}>ADMIN USER</p>
          <p style={{ color: '#3d4943', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Store Manager</p>
        </div>
      </div>
    </div>
  </header>
);

const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate, title, headerRight, searchPlaceholder, onSearch }) => (
  <div style={{ background: '#f7fbf9', color: '#191c1e', minHeight: '100vh' }}>
    <Sidebar activePage={activePage} onNavigate={onNavigate} />
    <main style={{ marginLeft: 256, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar title={title} headerRight={headerRight} searchPlaceholder={searchPlaceholder} onSearch={onSearch} />
      {children}
      <footer style={{ marginTop: 'auto', padding: '32px', textAlign: 'center', borderTop: '1px solid #c8e4d8' }}>
        <p style={{ color: '#3d4943', fontSize: 14 }}>© 2024 RetailPro Management System. All rights reserved.</p>
      </footer>
    </main>
  </div>
);

export default Layout;
