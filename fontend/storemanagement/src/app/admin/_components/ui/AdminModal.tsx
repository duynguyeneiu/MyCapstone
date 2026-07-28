'use client';
import Icon from './Icon';
import { C } from '../../_lib/types';

export function Modal({ open, onClose, children, width = 480 }: { open: boolean; onClose: () => void; children: React.ReactNode; width?: number }) {
  if (!open) return null;
  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 20, width, maxWidth: "95vw", overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,0.2)", animation: "pop .2s ease" }}>
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid ${C.outline}` }}>
      <h3 style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 18, fontWeight: 700, color: C.textMain }}>{title}</h3>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.textFaint, display: "flex" }}>
        <Icon name="close" size={22} />
      </button>
    </div>
  );
}
