'use client';

export function Badge({ text, color, bg }: { text: string; color: string; bg: string }) {
  return (
    <span style={{ background: bg, color, padding: "2px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
      {text}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Completed: { bg: "#D1FAE5", color: "#065F46" },
    Processing: { bg: "#DBEAFE", color: "#1E40AF" },
    Cancelled: { bg: "#FECACA", color: "#7F1D1D" },
    Active: { bg: "#D1FAE5", color: "#065F46" },
    Inactive: { bg: "#F3F4F6", color: "#6B7280" },
  };
  const s = map[status] ?? { bg: "#e0e3e5", color: "#3d4943" };
  return <Badge text={status} bg={s.bg} color={s.color} />;
}
