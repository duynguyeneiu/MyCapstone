'use client';
import { C } from '../../_lib/types';

export default function Btn({ children, onClick, variant = "primary", size = "md", disabled = false, style: sx }: {
  children: React.ReactNode; onClick?: () => void;
  variant?: "primary" | "amber" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg"; disabled?: boolean; style?: React.CSSProperties;
}) {
  const variants = {
    primary: { background: `linear-gradient(135deg,${C.primary},#00a86b)`, color: "#fff", border: "none", boxShadow: `0 2px 8px ${C.primary}44` },
    amber: { background: `linear-gradient(135deg,${C.amber},#fbbf24)`, color: "#431d00", border: "none", boxShadow: `0 2px 8px ${C.amber}44` },
    outline: { background: "#fff", color: C.primary, border: `1.5px solid ${C.primary}` },
    ghost: { background: "transparent", color: C.textMuted, border: `1.5px solid ${C.outline}` },
    danger: { background: "#fee2e2", color: "#991b1b", border: "1.5px solid #fca5a5" },
  };
  const sizes = { sm: { padding: "6px 12px", fontSize: 12 }, md: { padding: "8px 16px", fontSize: 13 }, lg: { padding: "12px 24px", fontSize: 15 } };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: 600, transition: "all .15s", opacity: disabled ? 0.5 : 1, ...variants[variant], ...sizes[size], ...sx }}>
      {children}
    </button>
  );
}
