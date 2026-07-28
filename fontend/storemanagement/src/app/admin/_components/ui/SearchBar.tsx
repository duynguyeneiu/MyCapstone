'use client';
import Icon from './Icon';
import { C } from '../../_lib/types';

export default function SearchBar({ value, onChange, placeholder = "Search..." }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px",
      background: "#fff8e6", border: `1.5px solid ${C.amberMid}`, borderRadius: 999 }}>
      <Icon name="search" size={20} style={{ color: C.textFaint }} />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ background: "transparent", border: "none", outline: "none", fontSize: 14, color: C.textMain, width: "100%" }} />
    </div>
  );
}
