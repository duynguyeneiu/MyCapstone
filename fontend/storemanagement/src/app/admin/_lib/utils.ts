// ─── HELPERS ─────────────────────────────────────────────────────────────────
export const fmt = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + " ₫";
export const initials = (name: string) => name.split(" ").map((w) => w[0]).slice(-2).join("").toUpperCase();
