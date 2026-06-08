'use client';

import Icon from '../ui/Icon';
import { C, NAV_ITEMS, type Page } from '../../_lib/types';

interface SidebarProps {
  activePage: Page;
  onNav: (p: Page) => void;
  onGoHome: () => void;
  adminName?: string;
  onLogout?: () => void;
}

export default function Sidebar({ activePage, onNav, onGoHome, adminName, onLogout }: SidebarProps) {
  return (
    <aside style={{
      width: 220, flexShrink: 0, height: '100vh', display: 'flex', flexDirection: 'column',
      padding: '20px 8px', overflow: 'auto',
      borderRight: `2px solid ${C.sidebarBorder}`,
      background: 'linear-gradient(180deg, #f4fbf7 0%, #fffdf5 100%)',
    }}>
      {/* Brand */}
      <div style={{ padding: '0 12px', marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 20, fontWeight: 700, color: C.primary, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'linear-gradient(135deg,#f59e0b,#00694c)', display: 'inline-block' }} />
          RetailPro
        </h1>
        <p style={{ fontSize: 11, color: C.textFaint, marginTop: 2 }}>Management System</p>
        {adminName && (
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {adminName.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase()}
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{adminName}</span>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map((item) => {
          const active = activePage === item.page;
          return (
            <button key={item.page} onClick={() => onNav(item.page)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8,
                border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', fontSize: 13,
                fontWeight: active ? 700 : 500,
                borderLeft: active ? `3px solid ${C.amber}` : '3px solid transparent',
                background: active ? `linear-gradient(90deg, ${C.amberLight} 0%, #fde68a22 100%)` : 'transparent',
                color: active ? C.primary : C.textMuted,
                transition: 'all .15s',
              }}>
              <Icon name={item.icon} size={20} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div style={{ borderTop: `1px solid ${C.outline}`, paddingTop: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Home button → back to shopping site */}
        <button onClick={onGoHome}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8,
            border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', fontSize: 13, fontWeight: 500,
            background: 'transparent', color: C.textMuted, transition: 'all .15s',
            borderLeft: '3px solid transparent',
          }}
          onMouseEnter={e => { const b = e.currentTarget; b.style.background = `${C.primary}0f`; b.style.color = C.primary; }}
          onMouseLeave={e => { const b = e.currentTarget; b.style.background = 'transparent'; b.style.color = C.textMuted; }}
        >
          <Icon name="home" size={20} /> Happy Market
        </button>

        {/* Sign out */}
        {onLogout && (
          <button onClick={onLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8,
              border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', fontSize: 13, fontWeight: 500,
              background: 'transparent', color: '#ef4444', transition: 'all .15s',
              borderLeft: '3px solid transparent',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <Icon name="logout" size={20} /> Sign Out
          </button>
        )}

        <p style={{ padding: '8px 12px', fontSize: 11, color: C.textFaint }}>© 2025 Happy Market</p>
      </div>
    </aside>
  );
}
