'use client';
import Icon from '../ui/Icon';
import { C, type Page } from '../../_lib/types';

export default function Header({ title, subtitle, onNav }: { title: string; subtitle?: string; onNav: (p: Page) => void }) {
  return (
    <header style={{
      height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 28px", flexShrink: 0,
      background: "linear-gradient(90deg,#f7fbf9 0%,#fffdf5 100%)",
      borderBottom: `1.5px solid ${C.sidebarBorder}`,
    }}>
      <div>
        <h2 style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 20, fontWeight: 700, color: C.textMain }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 12, color: C.textFaint }}>{subtitle}</p>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => onNav("pos")}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "none",
            background: `linear-gradient(135deg,${C.primary},#00a86b)`, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <Icon name="point_of_sale" size={18} style={{ color: "#fff" }} /> Open POS
        </button>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#1d6fb8", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff" }}>MT</div>
      </div>
    </header>
  );
}
