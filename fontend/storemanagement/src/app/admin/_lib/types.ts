// ─── THEME / DESIGN TOKENS ───────────────────────────────────────────────────
export const C = {
  primary: "#00694c",
  primaryDark: "#00513a",
  primaryLight: "#f0faf5",
  primaryBg: "#00694c18",
  amber: "#f59e0b",
  amberLight: "#fff3d6",
  amberMid: "#fcd97a",
  error: "#ba1a1a",
  errorBg: "#ffdad6",
  surface: "#f7fbf9",
  surfaceHigh: "#e6f4ee",
  surfaceLow: "#f4fbf7",
  surfaceLowest: "#ffffff",
  outline: "#c8e4d8",
  textMain: "#191c1e",
  textMuted: "#3d4943",
  textFaint: "#6d7a73",
  sidebarBorder: "#ffe08a",
};

export const globalStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Hanken+Grotesk:wght@600;700&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #f7fbf9; }
  .ms { font-family: 'Material Symbols Outlined'; font-variation-settings: 'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; font-style: normal; display: inline-block; line-height: 1; user-select: none; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-thumb { background: #bccac1; border-radius: 4px; }
  @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
  @keyframes pop { 0%{transform:scale(0.85);opacity:0} 100%{transform:scale(1);opacity:1} }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
`;

export type Page = "login" | "dashboard" | "pos" | "products" | "categories" | "orders" | "inventory" | "users" | "promotions" | "settings";

export const NAV_ITEMS: { page: Page; icon: string; label: string }[] = [
  { page: "dashboard", icon: "dashboard", label: "Dashboard" },
  { page: "pos", icon: "point_of_sale", label: "POS" },
  { page: "products", icon: "shopping_bag", label: "Products" },
  { page: "categories", icon: "category", label: "Categories" },
  { page: "orders", icon: "receipt_long", label: "Orders" },
  { page: "inventory", icon: "inventory", label: "Inventory" },
  { page: "promotions", icon: "sell", label: "Promotions" },
  { page: "users", icon: "people", label: "Users" },
  { page: "settings", icon: "settings", label: "Settings" },
];
