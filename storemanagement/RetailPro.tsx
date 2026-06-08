import { useState, useEffect, useRef, useCallback } from "react";

// ─── THEME / DESIGN TOKENS ───────────────────────────────────────────────────
const C = {
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

const globalStyle = `
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

// ─── SHARED DATA ─────────────────────────────────────────────────────────────
const STAFF_LIST = [
  { id: 1, name: "Minh Tran", role: "Staff", pin: "1234", color: "#1d6fb8" },
  { id: 2, name: "Lan Pham", role: "Staff", pin: "5678", color: "#6941c6" },
  { id: 3, name: "Hung Le", role: "Staff", pin: "2468", color: "#D97706" },
  { id: 4, name: "Thao Nguyen", role: "Staff", pin: "1357", color: "#dc2626" },
  { id: 5, name: "Bao Tran", role: "Staff", pin: "9999", color: "#059669" },
];

const ADMINS = [
  { username: "alex.nguyen", password: "admin123", name: "Alex Nguyen" },
  { username: "admin", password: "admin", name: "Admin" },
];

const CATEGORIES_DATA = [
  { id: 1, name: "Beverages", icon: "local_cafe", color: "#1d6fb8", products: 24, active: true },
  { id: 2, name: "Bakery", icon: "bakery_dining", color: "#D97706", products: 18, active: true },
  { id: 3, name: "Snacks", icon: "cookie", color: "#6941c6", products: 32, active: true },
  { id: 4, name: "Dairy", icon: "egg_alt", color: "#059669", products: 15, active: true },
  { id: 5, name: "Groceries", icon: "shopping_basket", color: "#dc2626", products: 47, active: true },
  { id: 6, name: "Supplies", icon: "inventory_2", color: "#0891b2", products: 11, active: false },
];

const PRODUCTS_DATA = [
  { id: 1, name: "Arabica Coffee Beans 1kg", sku: "BEV-001", category: "Beverages", price: 185000, stock: 2, barcode: "8934673500011", active: true },
  { id: 2, name: "Bánh Mì Flour Special 5kg", sku: "BAK-002", category: "Bakery", price: 95000, stock: 12, barcode: "8934673500022", active: true },
  { id: 3, name: "Coconut Milk Organic 400ml", sku: "GRO-003", category: "Groceries", price: 42000, stock: 8, barcode: "8934673500033", active: true },
  { id: 4, name: "Eco-Friendly Straws (Pack 50)", sku: "SUP-004", category: "Supplies", price: 28000, stock: 0, barcode: "8934673500044", active: false },
  { id: 5, name: "Vietnamese Drip Coffee Mix", sku: "BEV-005", category: "Beverages", price: 65000, stock: 45, barcode: "8934673500055", active: true },
  { id: 6, name: "Pandan Wafer Crispy 200g", sku: "SNK-006", category: "Snacks", price: 38000, stock: 30, barcode: "8934673500066", active: true },
  { id: 7, name: "Yogurt Strawberry 100g", sku: "DAI-007", category: "Dairy", price: 22000, stock: 60, barcode: "8934673500077", active: true },
  { id: 8, name: "Green Tea Matcha Latte", sku: "BEV-008", category: "Beverages", price: 55000, stock: 20, barcode: "8934673500088", active: true },
];

const ORDERS_DATA = [
  { id: "ORD-2584", customer: "Nguyen Van A", amount: 185000, status: "Completed", date: "2024-06-01", items: 3, payment: "Cash" },
  { id: "ORD-2583", customer: "Tran Thi B", amount: 320000, status: "Completed", date: "2024-06-01", items: 5, payment: "Card" },
  { id: "ORD-2582", customer: "Walk-in", amount: 75000, status: "Processing", date: "2024-06-01", items: 2, payment: "QR" },
  { id: "ORD-2581", customer: "Duc Huy", amount: 450000, status: "Cancelled", date: "2024-05-31", items: 7, payment: "Card" },
  { id: "ORD-2580", customer: "Le Van C", amount: 220000, status: "Completed", date: "2024-05-31", items: 4, payment: "Cash" },
  { id: "ORD-2579", customer: "Pham Thi D", amount: 99000, status: "Completed", date: "2024-05-31", items: 1, payment: "QR" },
];

const INVENTORY_DATA = [
  { id: 1, name: "Arabica Coffee Beans 1kg", sku: "BEV-001", category: "Beverages", stock: 2, minStock: 10, cost: 140000, lastUpdated: "2024-06-01" },
  { id: 2, name: "Eco-Friendly Straws (Pack 50)", sku: "SUP-004", category: "Supplies", stock: 0, minStock: 5, cost: 20000, lastUpdated: "2024-05-29" },
  { id: 3, name: "Bánh Mì Flour Special", sku: "BAK-002", category: "Bakery", stock: 12, minStock: 20, cost: 70000, lastUpdated: "2024-06-01" },
  { id: 4, name: "Coconut Milk Organic", sku: "GRO-003", category: "Groceries", stock: 8, minStock: 15, cost: 32000, lastUpdated: "2024-05-30" },
  { id: 5, name: "Vietnamese Drip Coffee Mix", sku: "BEV-005", category: "Beverages", stock: 45, minStock: 20, cost: 48000, lastUpdated: "2024-06-01" },
  { id: 6, name: "Pandan Wafer Crispy", sku: "SNK-006", category: "Snacks", stock: 30, minStock: 10, cost: 28000, lastUpdated: "2024-05-31" },
];

const USERS_DATA = [
  { id: 1, name: "Alex Nguyen", email: "alex.nguyen@retailpro.vn", role: "Admin", status: "Active", lastLogin: "2024-06-01 08:12", avatar: "#1d6fb8" },
  { id: 2, name: "Minh Tran", email: "minh.tran@retailpro.vn", role: "Staff", status: "Active", lastLogin: "2024-06-01 07:55", avatar: "#1d6fb8" },
  { id: 3, name: "Lan Pham", email: "lan.pham@retailpro.vn", role: "Staff", status: "Active", lastLogin: "2024-05-31 17:30", avatar: "#6941c6" },
  { id: 4, name: "Hung Le", email: "hung.le@retailpro.vn", role: "Staff", status: "Inactive", lastLogin: "2024-05-28 09:00", avatar: "#D97706" },
  { id: 5, name: "Thao Nguyen", email: "thao.nguyen@retailpro.vn", role: "Manager", status: "Active", lastLogin: "2024-06-01 08:00", avatar: "#dc2626" },
];

const PROMOTIONS_DATA = [
  { id: 1, code: "WELCOME10", type: "Percentage", value: 10, minOrder: 100000, used: 34, limit: 100, active: true, expires: "2024-12-31" },
  { id: 2, code: "SAVE50K", type: "Fixed", value: 50000, minOrder: 200000, used: 89, limit: 200, active: true, expires: "2024-07-31" },
  { id: 3, code: "FREESHIP", type: "Percentage", value: 100, minOrder: 300000, used: 200, limit: 200, active: false, expires: "2024-05-31" },
  { id: 4, code: "SUMMER20", type: "Percentage", value: 20, minOrder: 150000, used: 12, limit: 500, active: true, expires: "2024-08-31" },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + " ₫";
const initials = (name: string) => name.split(" ").map((w) => w[0]).slice(-2).join("").toUpperCase();

type Page = "login" | "dashboard" | "pos" | "products" | "categories" | "orders" | "inventory" | "users" | "promotions" | "settings";

const NAV_ITEMS: { page: Page; icon: string; label: string }[] = [
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

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────
function Icon({ name, size = 22, style }: { name: string; size?: number; style?: React.CSSProperties }) {
  return <span className="ms" style={{ fontSize: size, ...style }}>{name}</span>;
}

function Badge({ text, color, bg }: { text: string; color: string; bg: string }) {
  return (
    <span style={{ background: bg, color, padding: "2px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
      {text}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
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

function Modal({ open, onClose, children, width = 480 }: { open: boolean; onClose: () => void; children: React.ReactNode; width?: number }) {
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

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: `1px solid ${C.outline}` }}>
      <h3 style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 18, fontWeight: 700, color: C.textMain }}>{title}</h3>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.textFaint, display: "flex" }}>
        <Icon name="close" size={22} />
      </button>
    </div>
  );
}

function Sidebar({ activePage, onNav }: { activePage: Page; onNav: (p: Page) => void }) {
  return (
    <aside style={{
      width: 220, flexShrink: 0, height: "100vh", display: "flex", flexDirection: "column",
      padding: "20px 8px", overflow: "auto",
      borderRight: `2px solid ${C.sidebarBorder}`,
      background: "linear-gradient(180deg, #f4fbf7 0%, #fffdf5 100%)",
    }}>
      <div style={{ padding: "0 12px", marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 20, fontWeight: 700, color: C.primary, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "linear-gradient(135deg,#f59e0b,#00694c)", display: "inline-block" }} />
          RetailPro
        </h1>
        <p style={{ fontSize: 11, color: C.textFaint, marginTop: 2 }}>Management System</p>
      </div>
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map((item) => {
          const active = activePage === item.page;
          return (
            <button key={item.page} onClick={() => onNav(item.page)}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8,
                border: "none", cursor: "pointer", textAlign: "left", width: "100%", fontSize: 13, fontWeight: active ? 700 : 500,
                borderLeft: active ? `3px solid ${C.amber}` : "3px solid transparent",
                background: active ? `linear-gradient(90deg, ${C.amberLight} 0%, #fde68a22 100%)` : "transparent",
                color: active ? C.primary : C.textMuted,
                transition: "all .15s",
              }}>
              <Icon name={item.icon} size={20} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: "12px", borderTop: `1px solid ${C.outline}`, fontSize: 11, color: C.textFaint }}>
        © 2024 RetailPro
      </div>
    </aside>
  );
}

function Header({ title, subtitle, onNav }: { title: string; subtitle?: string; onNav: (p: Page) => void }) {
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

function SearchBar({ value, onChange, placeholder = "Search..." }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px",
      background: "#fff8e6", border: `1.5px solid ${C.amberMid}`, borderRadius: 999 }}>
      <Icon name="search" size={20} style={{ color: C.textFaint }} />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{ background: "transparent", border: "none", outline: "none", fontSize: 14, color: C.textMain, width: "100%" }} />
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", size = "md", disabled = false, style: sx }: {
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

// ─── PAGE: LOGIN ─────────────────────────────────────────────────────────────
function LoginPage({ onLogin }: { onLogin: () => void }) {
  type Screen = "select" | "pin" | "admin";
  const [screen, setScreen] = useState<Screen>("select");
  const [selectedStaff, setSelectedStaff] = useState<typeof STAFF_LIST[0] | null>(null);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [pinShake, setPinShake] = useState(false);
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [adminError, setAdminError] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);

  const handleStaffSelect = (s: typeof STAFF_LIST[0]) => {
    setSelectedStaff(s); setPin(""); setPinError(false); setScreen("pin");
  };

  const handleNumPress = (n: string) => {
    if (pin.length >= 4) return;
    const next = pin + n;
    setPin(next);
    if (next.length === 4) setTimeout(() => checkPin(next), 120);
  };

  const checkPin = (p: string) => {
    if (p === selectedStaff?.pin) { onLogin(); }
    else {
      setPinError(true); setPinShake(true);
      setTimeout(() => { setPinShake(false); setPin(""); setPinError(false); }, 500);
    }
  };

  const handleAdminLogin = () => {
    if (!adminUser || !adminPass) return;
    setAdminLoading(true);
    setTimeout(() => {
      setAdminLoading(false);
      if (ADMINS.find((a) => a.username === adminUser && a.password === adminPass)) {
        onLogin();
      } else { setAdminError(true); }
    }, 900);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#f2f4f6", padding: 24, flexDirection: "column" }}>
      <style>{globalStyle}</style>

      {screen === "select" && (
        <div style={{ width: "100%", maxWidth: 640, animation: "fadeIn .3s ease" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ width: 52, height: 52, background: `${C.primary}18`, borderRadius: 14, display: "flex",
              alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <Icon name="store" size={28} style={{ color: C.primary }} />
            </div>
            <h1 style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 26, fontWeight: 700, color: C.textMain }}>RetailPro</h1>
            <p style={{ fontSize: 14, color: C.textFaint, marginTop: 4 }}>Who's working today?</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 12 }}>
            {STAFF_LIST.map((s) => (
              <div key={s.id} onClick={() => handleStaffSelect(s)}
                style={{ background: "#fff", border: `1.5px solid #e0e3e5`, borderRadius: 16, padding: "20px 16px",
                  textAlign: "center", cursor: "pointer", transition: "all .15s", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLDivElement).style.borderColor = C.primary; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.borderColor = "#e0e3e5"; }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: s.color, display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#fff", margin: "0 auto 10px" }}>
                  {initials(s.name)}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: C.textFaint }}>{s.role}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 24 }}>
            <button onClick={() => setScreen("admin")}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 99,
                border: `1.5px solid #bccac1`, background: "#fff", color: C.textMuted, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              <Icon name="admin_panel_settings" size={18} /> Admin Login
            </button>
          </div>
          <p style={{ textAlign: "center", fontSize: 12, color: C.textFaint, marginTop: 28 }}>© 2024 RetailPro Management System</p>
        </div>
      )}

      {screen === "pin" && selectedStaff && (
        <div style={{ width: "100%", maxWidth: 360 }}>
          <button onClick={() => setScreen("select")}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer",
              color: C.textMuted, fontSize: 14, fontWeight: 500, marginBottom: 20 }}>
            <Icon name="arrow_back" size={20} /> Back
          </button>
          <div style={{ background: "#fff", borderRadius: 20, padding: "36px 32px", textAlign: "center",
            boxShadow: "0 24px 60px rgba(0,0,0,0.18)", animation: pinShake ? "shake .35s ease" : "pop .2s ease" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: selectedStaff.color,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700,
              color: "#fff", margin: "0 auto 12px" }}>{initials(selectedStaff.name)}</div>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>{selectedStaff.name}</h2>
            <p style={{ fontSize: 13, color: C.textFaint, marginTop: 4 }}>Enter your PIN</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 12, margin: "24px 0 8px" }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{
                  width: 14, height: 14, borderRadius: "50%", transition: "all .15s",
                  background: pinError ? "#dc2626" : i < pin.length ? C.primary : "#eceef0",
                  transform: i < pin.length ? "scale(1.15)" : "scale(1)",
                }} />
              ))}
            </div>
            {pinError && <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 8 }}>Incorrect PIN. Try again.</p>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, maxWidth: 240, margin: "12px auto 0" }}>
              {["1","2","3","4","5","6","7","8","9"].map((n) => (
                <button key={n} onClick={() => handleNumPress(n)}
                  style={{ padding: 16, borderRadius: 12, border: `1.5px solid #bccac1`, background: "#f7f9fb",
                    fontSize: 20, fontWeight: 600, cursor: "pointer", transition: "all .1s" }}>{n}</button>
              ))}
              <div />
              <button onClick={() => handleNumPress("0")}
                style={{ padding: 16, borderRadius: 12, border: `1.5px solid #bccac1`, background: "#f7f9fb",
                  fontSize: 20, fontWeight: 600, cursor: "pointer" }}>0</button>
              <button onClick={() => setPin((p) => p.slice(0, -1))}
                style={{ padding: 16, borderRadius: 12, border: `1.5px solid #bccac1`, background: "#f7f9fb", cursor: "pointer" }}>
                <Icon name="backspace" size={22} style={{ color: C.textFaint }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {screen === "admin" && (
        <div style={{ width: "100%", maxWidth: 400 }}>
          <button onClick={() => setScreen("select")}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer",
              color: C.textMuted, fontSize: 14, marginBottom: 20 }}>
            <Icon name="arrow_back" size={20} /> Back
          </button>
          <div style={{ background: "#fff", borderRadius: 20, padding: 40, boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <div style={{ width: 40, height: 40, background: C.primary, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="admin_panel_settings" size={22} style={{ color: "#fff" }} />
              </div>
              <div>
                <p style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 16, fontWeight: 700, color: C.primary }}>Admin Login</p>
                <p style={{ fontSize: 11, color: C.textFaint }}>Full system access</p>
              </div>
            </div>
            {adminError && (
              <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, padding: "12px 14px",
                display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Icon name="error" size={18} style={{ color: "#dc2626" }} />
                <span style={{ fontSize: 13, color: "#991b1b" }}>Invalid username or password</span>
              </div>
            )}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 5 }}>Username</label>
              <div style={{ position: "relative" }}>
                <Icon name="person" size={20} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.textFaint }} />
                <input value={adminUser} onChange={(e) => { setAdminUser(e.target.value); setAdminError(false); }}
                  placeholder="Enter username" type="text"
                  style={{ width: "100%", border: `1.5px solid ${adminError ? "#dc2626" : "#bccac1"}`, borderRadius: 10,
                    padding: "11px 14px 11px 40px", fontSize: 14, background: "#f7f9fb", outline: "none" }} />
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 5 }}>Password</label>
              <div style={{ position: "relative" }}>
                <Icon name="lock" size={20} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.textFaint }} />
                <input value={adminPass} onChange={(e) => { setAdminPass(e.target.value); setAdminError(false); }}
                  placeholder="Enter password" type={showPass ? "text" : "password"}
                  style={{ width: "100%", border: `1.5px solid ${adminError ? "#dc2626" : "#bccac1"}`, borderRadius: 10,
                    padding: "11px 44px 11px 40px", fontSize: 14, background: "#f7f9fb", outline: "none" }} />
                <button onClick={() => setShowPass(!showPass)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
                  <Icon name={showPass ? "visibility_off" : "visibility"} size={20} style={{ color: C.textFaint }} />
                </button>
              </div>
            </div>
            <button onClick={handleAdminLogin} disabled={adminLoading || !adminUser || !adminPass}
              style={{ width: "100%", padding: 13, background: C.primary, color: "#fff", border: "none", borderRadius: 10,
                fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                opacity: (!adminUser || !adminPass) ? 0.6 : 1 }}>
              {adminLoading ? <><Icon name="autorenew" size={20} style={{ animation: "spin .8s linear infinite" }} /> Signing in...</> : <>Sign In <Icon name="arrow_forward" size={20} style={{ color: "#fff" }} /></>}
            </button>
            <p style={{ textAlign: "center", fontSize: 12, color: C.textFaint, marginTop: 16 }}>
              Staff?{" "}
              <button onClick={() => setScreen("select")}
                style={{ background: "none", border: "none", color: C.primary, fontWeight: 600, cursor: "pointer", fontSize: 12 }}>
                Select your name instead
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PAGE: DASHBOARD ─────────────────────────────────────────────────────────
function DashboardPage({ onNav }: { onNav: (p: Page) => void }) {
  const stats = [
    { label: "Today's Revenue", value: "28.4M ₫", icon: "payments", change: "+12.3%", up: true, color: C.primary },
    { label: "Orders Today", value: "142", icon: "receipt_long", change: "+8 vs yesterday", up: true, color: "#1d6fb8" },
    { label: "Active Customers", value: "38", icon: "people", change: "+3 new", up: true, color: "#6941c6" },
    { label: "Low Stock Items", value: "4", icon: "inventory", change: "Needs restock", up: false, color: "#D97706" },
  ];
  const weekRevenue = [3.2, 4.1, 2.8, 5.0, 5.8, 3.9, 3.1];
  const weekLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const maxRev = Math.max(...weekRevenue);
  const recentOrders = ORDERS_DATA.slice(0, 4);
  const lowStock = INVENTORY_DATA.filter((i) => i.stock <= i.minStock).slice(0, 4);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "auto" }}>
      <Header title="Dashboard" subtitle="Monday, June 3, 2024" onNav={onNav} />
      <div style={{ flex: 1, padding: 28, overflow: "auto" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ background: "#fff", borderRadius: 12, padding: 20, border: `1px solid ${C.outline}`,
              transition: "transform .18s", cursor: "default" }}
              onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"}
              onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.transform = ""}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ fontSize: 12, color: C.textFaint, marginBottom: 6 }}>{s.label}</p>
                  <p style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 26, fontWeight: 700, color: C.textMain }}>{s.value}</p>
                  <p style={{ fontSize: 11, color: s.up ? "#059669" : C.amber, marginTop: 4, fontWeight: 600 }}>
                    {s.up ? "▲" : "▼"} {s.change}
                  </p>
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name={s.icon} size={24} style={{ color: s.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, marginBottom: 24 }}>
          {/* Bar chart */}
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: `1px solid ${C.outline}` }}>
            <h4 style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Weekly Revenue</h4>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 140 }}>
              {weekRevenue.map((v, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
                  <span style={{ fontSize: 10, color: C.textMuted, fontWeight: 600 }}>{v}M{v === maxRev && " ⭐"}</span>
                  <div style={{ width: "100%", borderRadius: "6px 6px 0 0", height: `${(v / 7) * 100}%`,
                    background: v === maxRev ? `linear-gradient(180deg,#4ade80,${C.primary})` : `linear-gradient(180deg,#86efac,${C.primary}66)`,
                    transition: "height .4s ease" }} />
                  <span style={{ fontSize: 11, color: C.textFaint }}>{weekLabels[i]}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Donut chart */}
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: `1px solid ${C.outline}` }}>
            <h4 style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Order Channels</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
              {[{ label: "POS (In-store)", val: 82, color: "#1d6fb8" }, { label: "Online", val: 60, color: C.amber }].map((ch) => (
                <div key={ch.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: C.textMuted }}>{ch.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: ch.color }}>{ch.val} orders</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 99, background: "#f0f0f0" }}>
                    <div style={{ height: "100%", borderRadius: 99, width: `${(ch.val / 142) * 100}%`, background: ch.color, transition: "width .5s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tables row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Recent Orders */}
          <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${C.outline}`, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.outline}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 16, fontWeight: 600 }}>Recent Orders</h4>
              <Btn variant="outline" size="sm" onClick={() => onNav("orders")}>View all</Btn>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ background: C.surfaceLow }}>
                {["Order", "Customer", "Amount", "Status"].map((h) => (
                  <th key={h} style={{ padding: "8px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: C.textFaint, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} style={{ borderBottom: `1px solid ${C.outline}` }}>
                    <td style={{ padding: "10px 16px", fontSize: 12 }}>#{o.id}</td>
                    <td style={{ padding: "10px 16px", fontSize: 12 }}>{o.customer}</td>
                    <td style={{ padding: "10px 16px", fontSize: 12, fontWeight: 600 }}>{fmt(o.amount)}</td>
                    <td style={{ padding: "10px 16px" }}><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Low Stock */}
          <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${C.outline}`, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.outline}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 16, fontWeight: 600 }}>Low Stock Alert</h4>
              <Btn variant="amber" size="sm" onClick={() => onNav("inventory")}>Restock All</Btn>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ background: C.surfaceLow }}>
                {["Product", "Category", "Stock"].map((h) => (
                  <th key={h} style={{ padding: "8px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: C.textFaint, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {lowStock.map((item) => (
                  <tr key={item.id} style={{ borderBottom: `1px solid ${C.outline}` }}>
                    <td style={{ padding: "10px 16px" }}>
                      <p style={{ fontSize: 12, fontWeight: 600 }}>{item.name}</p>
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: 12, color: C.textFaint }}>{item.category}</td>
                    <td style={{ padding: "10px 16px", fontSize: 12, fontWeight: 700,
                      color: item.stock === 0 ? C.error : item.stock <= item.minStock / 2 ? C.error : C.amber }}>
                      {item.stock} units
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE: POS ────────────────────────────────────────────────────────────────
function POSPage() {
  interface CartItem { id: number; name: string; price: number; qty: number; }
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [invoiceNo, setInvoiceNo] = useState(1);
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }));
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t);
  }, []);

  const cats = ["All", ...Array.from(new Set(PRODUCTS_DATA.map((p) => p.category)))];
  const filtered = PRODUCTS_DATA.filter((p) =>
    (activeCategory === "All" || p.category === activeCategory) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const addToCart = (product: typeof PRODUCTS_DATA[0]) => {
    if (product.stock === 0) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) => prev.map((i) => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter((i) => i.qty > 0));
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const vat = (subtotal - discount) * 0.1;
  const total = subtotal - discount + vat;

  const applyPromo = () => {
    if (promoCode === "WELCOME10") setDiscount(subtotal * 0.1);
    else if (promoCode === "SAVE50K") setDiscount(Math.min(50000, subtotal));
    else if (promoCode === "SUMMER20") setDiscount(subtotal * 0.2);
    else alert("Invalid promo code");
  };

  const processPayment = () => {
    setShowCheckout(false);
    setShowSuccess(true);
  };

  const newInvoice = () => {
    setShowSuccess(false); setCart([]); setDiscount(0); setPromoCode(""); setInvoiceNo((n) => n + 1);
  };

  const payMethods = [
    { id: "Cash", icon: "payments", label: "Cash" },
    { id: "Card", icon: "credit_card", label: "Card" },
    { id: "QR", icon: "qr_code", label: "QR Pay" },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "#f2f4f6" }}>
      {/* Topbar */}
      <div style={{ height: 56, background: "#fff", borderBottom: `1px solid #e0e3e5`, display: "flex", alignItems: "center", padding: "0 16px", gap: 12, flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, background: C.primary, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="point_of_sale" size={18} style={{ color: "#fff" }} />
        </div>
        <span style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 18, fontWeight: 700, color: C.primary, flex: 1 }}>RetailPro POS</span>
        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 99, background: "#d1fae5", color: "#064e3b" }}>In-Store</span>
        <span style={{ fontSize: 13, color: C.textMuted, fontWeight: 500 }}>{clock}</span>
        <div style={{ width: 1, height: 20, background: "#e0e3e5" }} />
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#1d6fb8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>MT</div>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Minh Tran</span>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left: products */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", borderRight: `1px solid #e0e3e5`, background: "#fff" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid #e0e3e5` }}>
            <div style={{ position: "relative" }}>
              <Icon name="search" size={20} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.textFaint }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product or scan barcode..."
                style={{ width: "100%", border: `1.5px solid #e0e3e5`, borderRadius: 10, padding: "9px 12px 9px 38px", fontSize: 14, background: "#f7f9fb", outline: "none" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, padding: "10px 16px", borderBottom: `1px solid #e0e3e5`, overflowX: "auto", flexShrink: 0 }}>
            {cats.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                style={{ padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                  border: `1.5px solid ${activeCategory === cat ? C.primary : "#e0e3e5"}`,
                  background: activeCategory === cat ? C.primary : "#fff",
                  color: activeCategory === cat ? "#fff" : C.textMuted }}>
                {cat}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: 12, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 10, alignContent: "start" }}>
            {filtered.map((p) => (
              <div key={p.id} onClick={() => addToCart(p)}
                style={{ border: `1.5px solid #e0e3e5`, borderRadius: 12, padding: "12px 10px", cursor: p.stock === 0 ? "not-allowed" : "pointer",
                  opacity: p.stock === 0 ? 0.45 : 1, background: "#fff", transition: "all .15s" }}
                onMouseEnter={(e) => { if (p.stock > 0) { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = C.primary; el.style.transform = "translateY(-1px)"; el.style.boxShadow = `0 4px 12px ${C.primary}20`; }}}
                onMouseLeave={(e) => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "#e0e3e5"; el.style.transform = ""; el.style.boxShadow = ""; }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: C.primaryBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                  <Icon name="shopping_bag" size={24} style={{ color: C.primary }} />
                </div>
                <p style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3, marginBottom: 4 }}>{p.name}</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.primary }}>{fmt(p.price)}</p>
                <p style={{ fontSize: 11, color: p.stock === 0 ? "#dc2626" : p.stock <= 5 ? C.amber : C.textFaint, marginTop: 2, fontWeight: p.stock <= 5 ? 600 : 400 }}>
                  {p.stock === 0 ? "Out of stock" : p.stock <= 5 ? `⚠ ${p.stock} left` : `${p.stock} in stock`}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: cart */}
        <div style={{ width: 360, display: "flex", flexDirection: "column", background: "#fff", flexShrink: 0 }}>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid #e0e3e5`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>Invoice #{String(invoiceNo).padStart(4, "0")}</span>
            <button onClick={() => setCart([])} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: 12, fontWeight: 600 }}>
              <Icon name="delete" size={16} /> Clear
            </button>
          </div>

          <div style={{ flex: 1, overflow: "auto", padding: "8px 0" }}>
            {cart.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#bccac1", gap: 8 }}>
                <Icon name="shopping_cart" size={48} style={{ color: "#bccac1" }} />
                <p style={{ fontSize: 14 }}>Cart is empty</p>
                <p style={{ fontSize: 12 }}>Click products to add</p>
              </div>
            ) : cart.map((item) => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderBottom: `1px solid #f2f4f6` }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</p>
                  <p style={{ fontSize: 12, color: C.textFaint }}>{fmt(item.price)}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <button onClick={() => updateQty(item.id, -1)}
                    style={{ width: 24, height: 24, borderRadius: 6, border: `1.5px solid #e0e3e5`, background: "#f7f9fb", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>−</button>
                  <span style={{ width: 28, textAlign: "center", fontSize: 14, fontWeight: 700 }}>{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)}
                    style={{ width: 24, height: 24, borderRadius: 6, border: `1.5px solid #e0e3e5`, background: "#f7f9fb", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>+</button>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, width: 80, textAlign: "right" }}>{fmt(item.price * item.qty)}</span>
                <button onClick={() => setCart((c) => c.filter((i) => i.id !== item.id))}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#bccac1" }}>
                  <Icon name="close" size={18} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ padding: "12px 16px", borderTop: `1px solid #e0e3e5` }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              <input value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Promo code"
                style={{ flex: 1, border: `1.5px solid #e0e3e5`, borderRadius: 8, padding: "7px 10px", fontSize: 13, background: "#f7f9fb", outline: "none", textTransform: "uppercase" }} />
              <button onClick={applyPromo}
                style={{ padding: "7px 12px", borderRadius: 8, border: `1.5px solid ${C.primary}`, background: C.primaryLight, color: C.primary, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Apply</button>
            </div>
            {[["Subtotal", fmt(subtotal)], ["Discount", discount > 0 ? `-${fmt(discount)}` : "—"], ["VAT (10%)", fmt(vat)]].map(([label, val]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: C.textFaint }}>{label}</span>
                <span style={{ fontWeight: 500 }}>{val}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700, paddingTop: 10, borderTop: `1.5px solid #e0e3e5`, marginTop: 6 }}>
              <span>TOTAL</span>
              <span style={{ color: C.primary, fontSize: 18 }}>{fmt(total)}</span>
            </div>
          </div>

          <div style={{ padding: "12px 16px", borderTop: `1px solid #e0e3e5` }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginBottom: 10 }}>
              {payMethods.map((m) => (
                <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                  style={{ padding: "8px 6px", border: `1.5px solid ${paymentMethod === m.id ? C.primary : "#e0e3e5"}`,
                    borderRadius: 8, textAlign: "center", cursor: "pointer", background: paymentMethod === m.id ? C.primaryLight : "#fff",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                  <Icon name={m.icon} size={18} style={{ color: paymentMethod === m.id ? C.primary : C.textFaint }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: paymentMethod === m.id ? C.primary : C.textFaint }}>{m.label}</span>
                </button>
              ))}
            </div>
            <button onClick={() => cart.length > 0 && setShowCheckout(true)} disabled={cart.length === 0}
              style={{ width: "100%", padding: 14, background: cart.length === 0 ? "#bccac1" : C.primary, color: "#fff", border: "none", borderRadius: 12,
                fontSize: 16, fontWeight: 700, cursor: cart.length === 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Icon name="payment" size={20} style={{ color: "#fff" }} /> Checkout {cart.length > 0 ? `• ${fmt(total)}` : ""}
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <Modal open={showCheckout} onClose={() => setShowCheckout(false)} width={420}>
        <ModalHeader title={`Checkout — ${paymentMethod}`} onClose={() => setShowCheckout(false)} />
        <div style={{ padding: 24 }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <p style={{ fontSize: 13, color: C.textFaint }}>Total Amount</p>
            <p style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 32, fontWeight: 700, color: C.primary }}>{fmt(total)}</p>
          </div>
          {paymentMethod === "Cash" && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 6 }}>Cash tendered</label>
              <input type="number" placeholder="Enter amount" defaultValue={total}
                style={{ width: "100%", border: `1.5px solid ${C.outline}`, borderRadius: 10, padding: "10px 14px", fontSize: 16, fontWeight: 700, outline: "none" }} />
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                {[50000, 100000, 200000, 500000].map((v) => (
                  <button key={v} style={{ flex: 1, padding: "6px 4px", borderRadius: 8, border: `1.5px solid ${C.outline}`,
                    fontSize: 11, fontWeight: 600, cursor: "pointer", background: "#f7f9fb" }}>{v / 1000}K</button>
                ))}
              </div>
            </div>
          )}
          {paymentMethod === "QR" && (
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ width: 160, height: 160, background: "#f3f4f6", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                <Icon name="qr_code_2" size={120} style={{ color: C.primary }} />
              </div>
              <p style={{ fontSize: 12, color: C.textFaint, marginTop: 8 }}>Scan QR code to pay</p>
            </div>
          )}
          <button onClick={processPayment}
            style={{ width: "100%", padding: 14, background: C.primary, color: "#fff", border: "none", borderRadius: 12,
              fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Icon name="check_circle" size={20} style={{ color: "#fff" }} /> Confirm Payment
          </button>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal open={showSuccess} onClose={newInvoice} width={380}>
        <div style={{ padding: 36, textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Icon name="check_circle" size={40} style={{ color: "#059669" }} />
          </div>
          <h3 style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Payment Successful!</h3>
          <p style={{ fontSize: 14, color: C.textFaint, marginBottom: 4 }}>Invoice #{String(invoiceNo).padStart(4, "0")} • {cart.reduce((s, i) => s + i.qty, 0)} items</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: C.primary, marginBottom: 24 }}>{fmt(total)}</p>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="outline" onClick={newInvoice} style={{ flex: 1, justifyContent: "center" }}>New Invoice</Btn>
            <Btn variant="primary" onClick={newInvoice} style={{ flex: 1, justifyContent: "center" }}>
              <Icon name="print" size={16} style={{ color: "#fff" }} /> Print
            </Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── PAGE: PRODUCTS ───────────────────────────────────────────────────────────
function ProductsPage({ onNav }: { onNav: (p: Page) => void }) {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState(PRODUCTS_DATA);
  const [editProduct, setEditProduct] = useState<typeof PRODUCTS_DATA[0] | null>(null);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditProduct(null); setShowModal(true); };
  const openEdit = (p: typeof PRODUCTS_DATA[0]) => { setEditProduct(p); setShowModal(true); };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Header title="Products" subtitle={`${products.length} total products`} onNav={onNav} />
      <div style={{ flex: 1, padding: 28, overflow: "auto" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
          <div style={{ flex: 1 }}><SearchBar value={search} onChange={setSearch} placeholder="Search products..." /></div>
          <Btn variant="primary" onClick={openAdd}><Icon name="add" size={18} style={{ color: "#fff" }} /> Add Product</Btn>
        </div>
        <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${C.outline}`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: C.surfaceLow }}>
              {["SKU", "Product Name", "Category", "Price", "Stock", "Status", "Actions"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: C.textFaint, textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} style={{ borderBottom: `1px solid ${C.outline}` }}>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: C.textFaint }}>{p.sku}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: C.primaryBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon name="shopping_bag" size={18} style={{ color: C.primary }} />
                      </div>
                      <p style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</p>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 12 }}>{p.category}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: C.primary }}>{fmt(p.price)}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: p.stock === 0 ? C.error : p.stock <= 5 ? C.amber : C.textMain }}>{p.stock}</td>
                  <td style={{ padding: "12px 16px" }}><StatusBadge status={p.active ? "Active" : "Inactive"} /></td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => openEdit(p)} style={{ background: "none", border: "none", cursor: "pointer", color: C.primary }}><Icon name="edit" size={18} /></button>
                      <button onClick={() => setProducts((prev) => prev.filter((i) => i.id !== p.id))} style={{ background: "none", border: "none", cursor: "pointer", color: C.error }}><Icon name="delete" size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <ModalHeader title={editProduct ? "Edit Product" : "Add New Product"} onClose={() => setShowModal(false)} />
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          {[["Product Name", editProduct?.name ?? ""], ["SKU", editProduct?.sku ?? ""], ["Price (VND)", String(editProduct?.price ?? "")], ["Stock Quantity", String(editProduct?.stock ?? "")]].map(([label, val]) => (
            <div key={label}>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 5 }}>{label}</label>
              <input defaultValue={val} style={{ width: "100%", border: `1.5px solid ${C.outline}`, borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none" }} />
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => setShowModal(false)} style={{ flex: 1, justifyContent: "center" }}>Cancel</Btn>
            <Btn variant="primary" onClick={() => setShowModal(false)} style={{ flex: 1, justifyContent: "center" }}>Save Product</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── PAGE: CATEGORIES ─────────────────────────────────────────────────────────
function CategoriesPage({ onNav }: { onNav: (p: Page) => void }) {
  const [categories, setCategories] = useState(CATEGORIES_DATA);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Header title="Categories" subtitle={`${categories.length} categories`} onNav={onNav} />
      <div style={{ flex: 1, padding: 28, overflow: "auto" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1 }}><SearchBar value={search} onChange={setSearch} placeholder="Search categories..." /></div>
          <Btn variant="primary" onClick={() => setShowModal(true)}><Icon name="add" size={18} style={{ color: "#fff" }} /> Add Category</Btn>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
          {filtered.map((cat) => (
            <div key={cat.id} style={{ background: "#fff", borderRadius: 12, padding: 20, border: `1px solid ${C.outline}`, transition: "transform .18s" }}
              onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"}
              onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.transform = ""}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${cat.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name={cat.icon} size={28} style={{ color: cat.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 16 }}>{cat.name}</p>
                  <p style={{ fontSize: 12, color: C.textFaint }}>{cat.products} products</p>
                </div>
                <StatusBadge status={cat.active ? "Active" : "Inactive"} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn variant="outline" size="sm" style={{ flex: 1, justifyContent: "center" }}><Icon name="edit" size={14} /> Edit</Btn>
                <Btn variant="danger" size="sm" onClick={() => setCategories((c) => c.filter((i) => i.id !== cat.id))}><Icon name="delete" size={14} /></Btn>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <ModalHeader title="Add New Category" onClose={() => setShowModal(false)} />
        <div style={{ padding: 24 }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 5 }}>Category Name</label>
            <input placeholder="e.g. Beverages" style={{ width: "100%", border: `1.5px solid ${C.outline}`, borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none" }} />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <Btn variant="ghost" onClick={() => setShowModal(false)} style={{ flex: 1, justifyContent: "center" }}>Cancel</Btn>
            <Btn variant="primary" onClick={() => setShowModal(false)} style={{ flex: 1, justifyContent: "center" }}>Save</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── PAGE: ORDERS ─────────────────────────────────────────────────────────────
function OrdersPage({ onNav }: { onNav: (p: Page) => void }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState<typeof ORDERS_DATA[0] | null>(null);

  const filtered = ORDERS_DATA.filter((o) =>
    (statusFilter === "All" || o.status === statusFilter) &&
    (o.id.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = [
    { label: "Total Orders", value: ORDERS_DATA.length, icon: "receipt_long", color: C.primary },
    { label: "Completed", value: ORDERS_DATA.filter((o) => o.status === "Completed").length, icon: "check_circle", color: "#059669" },
    { label: "Processing", value: ORDERS_DATA.filter((o) => o.status === "Processing").length, icon: "pending", color: "#1d6fb8" },
    { label: "Cancelled", value: ORDERS_DATA.filter((o) => o.status === "Cancelled").length, icon: "cancel", color: C.error },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Header title="Orders" subtitle="Manage all orders" onNav={onNav} />
      <div style={{ flex: 1, padding: 28, overflow: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ background: "#fff", borderRadius: 12, padding: 20, border: `1px solid ${C.outline}`, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name={s.icon} size={24} style={{ color: s.color }} />
              </div>
              <div>
                <p style={{ fontSize: 12, color: C.textFaint }}>{s.label}</p>
                <p style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 24, fontWeight: 700 }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
          <div style={{ flex: 1 }}><SearchBar value={search} onChange={setSearch} placeholder="Search order or customer..." /></div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "9px 12px", border: `1.5px solid ${C.amberMid}`, borderRadius: 8, fontSize: 13, background: "#fff8e6", outline: "none", color: C.textMuted }}>
            {["All", "Completed", "Processing", "Cancelled"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${C.outline}`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: C.surfaceLow }}>
              {["Order ID", "Customer", "Date", "Items", "Amount", "Payment", "Status", ""].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: C.textFaint, textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} style={{ borderBottom: `1px solid ${C.outline}` }}>
                  <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: C.primary }}>#{o.id}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13 }}>{o.customer}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: C.textFaint }}>{o.date}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13 }}>{o.items}</td>
                  <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700 }}>{fmt(o.amount)}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12 }}>{o.payment}</td>
                  <td style={{ padding: "12px 16px" }}><StatusBadge status={o.status} /></td>
                  <td style={{ padding: "12px 16px" }}>
                    <button onClick={() => setSelectedOrder(o)} style={{ background: "none", border: "none", cursor: "pointer", color: C.primary }}>
                      <Icon name="visibility" size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!selectedOrder} onClose={() => setSelectedOrder(null)}>
        {selectedOrder && <>
          <ModalHeader title={`Order #${selectedOrder.id}`} onClose={() => setSelectedOrder(null)} />
          <div style={{ padding: 24 }}>
            {[["Customer", selectedOrder.customer], ["Date", selectedOrder.date], ["Items", String(selectedOrder.items)],
              ["Payment", selectedOrder.payment], ["Amount", fmt(selectedOrder.amount)]].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${C.outline}` }}>
                <span style={{ fontSize: 13, color: C.textFaint }}>{k}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0" }}>
              <span style={{ fontSize: 13, color: C.textFaint }}>Status</span>
              <StatusBadge status={selectedOrder.status} />
            </div>
            <Btn variant="primary" onClick={() => setSelectedOrder(null)} style={{ width: "100%", justifyContent: "center", marginTop: 16 }}>Close</Btn>
          </div>
        </>}
      </Modal>
    </div>
  );
}

// ─── PAGE: INVENTORY ──────────────────────────────────────────────────────────
function InventoryPage({ onNav }: { onNav: (p: Page) => void }) {
  const [inventory, setInventory] = useState(INVENTORY_DATA);
  const [search, setSearch] = useState("");
  const [showRestock, setShowRestock] = useState<typeof INVENTORY_DATA[0] | null>(null);
  const [restockQty, setRestockQty] = useState(0);

  const filtered = inventory.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase())
  );

  const getStockStatus = (item: typeof INVENTORY_DATA[0]) => {
    if (item.stock === 0) return { label: "Out of Stock", color: C.error, bg: "#fecaca" };
    if (item.stock < item.minStock) return { label: "Low Stock", color: "#854f0b", bg: "#fef3c7" };
    return { label: "In Stock", color: "#065f46", bg: "#d1fae5" };
  };

  const handleRestock = () => {
    if (!showRestock) return;
    setInventory((prev) => prev.map((i) => i.id === showRestock.id ? { ...i, stock: i.stock + restockQty } : i));
    setShowRestock(null); setRestockQty(0);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Header title="Inventory" subtitle="Stock management" onNav={onNav} />
      <div style={{ flex: 1, padding: 28, overflow: "auto" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1 }}><SearchBar value={search} onChange={setSearch} placeholder="Search inventory..." /></div>
          <Btn variant="amber" onClick={() => {}}><Icon name="download" size={18} style={{ color: "#431d00" }} /> Export</Btn>
        </div>

        <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${C.outline}`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: C.surfaceLow }}>
              {["SKU", "Product", "Category", "Current Stock", "Min Stock", "Unit Cost", "Status", "Actions"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: C.textFaint, textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map((item) => {
                const status = getStockStatus(item);
                return (
                  <tr key={item.id} style={{ borderBottom: `1px solid ${C.outline}` }}>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: C.textFaint }}>{item.sku}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600 }}>{item.name}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12 }}>{item.category}</td>
                    <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 700, color: status.color }}>{item.stock}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13, color: C.textFaint }}>{item.minStock}</td>
                    <td style={{ padding: "12px 16px", fontSize: 13 }}>{fmt(item.cost)}</td>
                    <td style={{ padding: "12px 16px" }}><Badge text={status.label} color={status.color} bg={status.bg} /></td>
                    <td style={{ padding: "12px 16px" }}>
                      <button onClick={() => { setShowRestock(item); setRestockQty(item.minStock - item.stock); }}
                        style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", borderRadius: 8,
                          background: `linear-gradient(135deg,${C.amber},#fbbf24)`, color: "#431d00", border: "none",
                          fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        <Icon name="add_box" size={14} /> Restock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={!!showRestock} onClose={() => setShowRestock(null)}>
        {showRestock && <>
          <ModalHeader title={`Restock: ${showRestock.name}`} onClose={() => setShowRestock(null)} />
          <div style={{ padding: 24 }}>
            <div style={{ background: C.surfaceLow, borderRadius: 10, padding: 14, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: C.textFaint }}>Current stock</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: getStockStatus(showRestock).color }}>{showRestock.stock} units</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontSize: 13, color: C.textFaint }}>Min stock</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{showRestock.minStock} units</span>
              </div>
            </div>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 6 }}>Quantity to add</label>
            <input type="number" value={restockQty} onChange={(e) => setRestockQty(Number(e.target.value))} min={1}
              style={{ width: "100%", border: `1.5px solid ${C.outline}`, borderRadius: 8, padding: "10px 12px", fontSize: 16, fontWeight: 700, outline: "none", marginBottom: 20 }} />
            <div style={{ display: "flex", gap: 10 }}>
              <Btn variant="ghost" onClick={() => setShowRestock(null)} style={{ flex: 1, justifyContent: "center" }}>Cancel</Btn>
              <Btn variant="amber" onClick={handleRestock} style={{ flex: 1, justifyContent: "center" }}>
                <Icon name="add_box" size={16} /> Confirm Restock
              </Btn>
            </div>
          </div>
        </>}
      </Modal>
    </div>
  );
}

// ─── PAGE: USERS ─────────────────────────────────────────────────────────────
function UsersPage({ onNav }: { onNav: (p: Page) => void }) {
  const [users, setUsers] = useState(USERS_DATA);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Header title="Users" subtitle="Manage staff accounts" onNav={onNav} />
      <div style={{ flex: 1, padding: 28, overflow: "auto" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1 }}><SearchBar value={search} onChange={setSearch} placeholder="Search users..." /></div>
          <Btn variant="primary" onClick={() => setShowModal(true)}><Icon name="person_add" size={18} style={{ color: "#fff" }} /> Add User</Btn>
        </div>
        <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${C.outline}`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: C.surfaceLow }}>
              {["User", "Email", "Role", "Last Login", "Status", "Actions"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: C.textFaint, textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} style={{ borderBottom: `1px solid ${C.outline}` }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: u.avatar, display: "flex",
                        alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>
                        {initials(u.name)}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: C.textFaint }}>{u.email}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge text={u.role} bg={u.role === "Admin" ? C.primaryBg : u.role === "Manager" ? "#ede9fe" : "#f3f4f6"}
                      color={u.role === "Admin" ? C.primary : u.role === "Manager" ? "#6941c6" : C.textMuted} />
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: C.textFaint }}>{u.lastLogin}</td>
                  <td style={{ padding: "12px 16px" }}><StatusBadge status={u.status} /></td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={{ background: "none", border: "none", cursor: "pointer", color: C.primary }}><Icon name="edit" size={18} /></button>
                      <button onClick={() => setUsers((prev) => prev.filter((i) => i.id !== u.id))}
                        style={{ background: "none", border: "none", cursor: "pointer", color: C.error }}><Icon name="delete" size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <ModalHeader title="Add New User" onClose={() => setShowModal(false)} />
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          {[["Full Name", "text"], ["Email", "email"], ["Password", "password"]].map(([label, type]) => (
            <div key={label}>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 5 }}>{label}</label>
              <input type={type} style={{ width: "100%", border: `1.5px solid ${C.outline}`, borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none" }} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 5 }}>Role</label>
            <select style={{ width: "100%", border: `1.5px solid ${C.outline}`, borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none", background: "#fff" }}>
              {["Staff", "Manager", "Admin"].map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <Btn variant="ghost" onClick={() => setShowModal(false)} style={{ flex: 1, justifyContent: "center" }}>Cancel</Btn>
            <Btn variant="primary" onClick={() => setShowModal(false)} style={{ flex: 1, justifyContent: "center" }}>Create User</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── PAGE: PROMOTIONS ─────────────────────────────────────────────────────────
function PromotionsPage({ onNav }: { onNav: (p: Page) => void }) {
  const [promotions, setPromotions] = useState(PROMOTIONS_DATA);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const filtered = promotions.filter((p) => p.code.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Header title="Promotions" subtitle="Discount codes & campaigns" onNav={onNav} />
      <div style={{ flex: 1, padding: 28, overflow: "auto" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1 }}><SearchBar value={search} onChange={setSearch} placeholder="Search promo codes..." /></div>
          <Btn variant="primary" onClick={() => setShowModal(true)}><Icon name="add" size={18} style={{ color: "#fff" }} /> New Promotion</Btn>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
          {filtered.map((promo) => (
            <div key={promo.id} style={{ background: "#fff", borderRadius: 12, padding: 20, border: `1px solid ${C.outline}`, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, right: 0, width: 60, height: 60,
                background: promo.active ? `${C.primary}08` : "#f3f4f6", borderRadius: "0 0 0 60px" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.amberLight, borderRadius: 8, padding: "4px 10px", marginBottom: 8 }}>
                    <Icon name="sell" size={14} style={{ color: C.amber }} />
                    <span style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 16, fontWeight: 700, color: C.textMain, letterSpacing: 1 }}>{promo.code}</span>
                  </div>
                  <p style={{ fontSize: 12, color: C.textFaint }}>Expires: {promo.expires}</p>
                </div>
                <StatusBadge status={promo.active ? "Active" : "Inactive"} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                {[["Discount", promo.type === "Percentage" ? `${promo.value}%` : fmt(promo.value)],
                  ["Min Order", fmt(promo.minOrder)],
                  ["Used", `${promo.used}/${promo.limit}`]].map(([k, v]) => (
                  <div key={k} style={{ background: C.surfaceLow, borderRadius: 8, padding: "8px 10px" }}>
                    <p style={{ fontSize: 10, color: C.textFaint }}>{k}</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: C.textMain }}>{v}</p>
                  </div>
                ))}
              </div>
              <div style={{ background: "#f0f0f0", height: 6, borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 99, width: `${(promo.used / promo.limit) * 100}%`,
                  background: promo.used >= promo.limit ? C.error : C.primary }} />
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <Btn variant="outline" size="sm" style={{ flex: 1, justifyContent: "center" }}>Edit</Btn>
                <Btn variant="danger" size="sm" onClick={() => setPromotions((p) => p.filter((i) => i.id !== promo.id))}>
                  <Icon name="delete" size={14} />
                </Btn>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <ModalHeader title="Create Promotion" onClose={() => setShowModal(false)} />
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          {[["Promo Code", "text", "e.g. SUMMER20"], ["Discount Value", "number", "e.g. 20 or 50000"], ["Min Order (VND)", "number", "e.g. 100000"]].map(([label, type, ph]) => (
            <div key={label}>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 5 }}>{label}</label>
              <input type={type as string} placeholder={ph as string}
                style={{ width: "100%", border: `1.5px solid ${C.outline}`, borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none" }} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 5 }}>Discount Type</label>
            <select style={{ width: "100%", border: `1.5px solid ${C.outline}`, borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none", background: "#fff" }}>
              <option>Percentage</option><option>Fixed</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="ghost" onClick={() => setShowModal(false)} style={{ flex: 1, justifyContent: "center" }}>Cancel</Btn>
            <Btn variant="primary" onClick={() => setShowModal(false)} style={{ flex: 1, justifyContent: "center" }}>Create</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── PAGE: SETTINGS ───────────────────────────────────────────────────────────
function SettingsPage({ onNav }: { onNav: (p: Page) => void }) {
  const [storeName, setStoreName] = useState("RetailPro Store");
  const [storeAddress, setStoreAddress] = useState("123 Nguyen Hue, Q1, TP.HCM");
  const [storePhone, setStorePhone] = useState("028 3825 1234");
  const [taxRate, setTaxRate] = useState("10");
  const [currency, setCurrency] = useState("VND");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sections = [
    {
      title: "Store Information",
      icon: "store",
      fields: [
        { label: "Store Name", value: storeName, onChange: setStoreName },
        { label: "Address", value: storeAddress, onChange: setStoreAddress },
        { label: "Phone Number", value: storePhone, onChange: setStorePhone },
      ],
    },
    {
      title: "Financial Settings",
      icon: "payments",
      fields: [
        { label: "Tax Rate (%)", value: taxRate, onChange: setTaxRate },
        { label: "Currency", value: currency, onChange: setCurrency },
      ],
    },
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Header title="Settings" subtitle="System configuration" onNav={onNav} />
      <div style={{ flex: 1, padding: 28, overflow: "auto", maxWidth: 760, margin: "0 auto", width: "100%" }}>
        {sections.map((sec) => (
          <div key={sec.title} style={{ background: "#fff", borderRadius: 12, border: `1px solid ${C.outline}`, marginBottom: 20, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.outline}`, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: C.primaryBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name={sec.icon} size={20} style={{ color: C.primary }} />
              </div>
              <h4 style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 16, fontWeight: 600 }}>{sec.title}</h4>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              {sec.fields.map((f) => (
                <div key={f.label}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, display: "block", marginBottom: 6 }}>{f.label}</label>
                  <input value={f.value} onChange={(e) => f.onChange(e.target.value)}
                    style={{ width: "100%", border: `1.5px solid ${C.outline}`, borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none", transition: "border-color .15s" }}
                    onFocus={(e) => (e.target.style.borderColor = C.primary)}
                    onBlur={(e) => (e.target.style.borderColor = C.outline)} />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Danger zone */}
        <div style={{ background: "#fff", borderRadius: 12, border: `1.5px solid ${C.errorBg}`, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.errorBg}`, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: C.errorBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="warning" size={20} style={{ color: C.error }} />
            </div>
            <h4 style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 16, fontWeight: 600, color: C.error }}>Danger Zone</h4>
          </div>
          <div style={{ padding: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600 }}>Reset All Data</p>
              <p style={{ fontSize: 12, color: C.textFaint }}>This action cannot be undone. All data will be permanently deleted.</p>
            </div>
            <Btn variant="danger"><Icon name="delete_forever" size={16} /> Reset</Btn>
          </div>
        </div>

        <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <Btn variant="ghost">Cancel</Btn>
          <Btn variant="primary" onClick={handleSave}>
            {saved ? <><Icon name="check" size={16} style={{ color: "#fff" }} /> Saved!</> : <><Icon name="save" size={16} style={{ color: "#fff" }} /> Save Settings</>}
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function RetailProApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState<Page>("dashboard");

  const renderPage = () => {
    if (!isLoggedIn) return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
    if (activePage === "pos") return (
      <div style={{ display: "flex", height: "100vh" }}>
        <Sidebar activePage={activePage} onNav={setActivePage} />
        <POSPage />
      </div>
    );
    return (
      <div style={{ display: "flex", height: "100vh" }}>
        <Sidebar activePage={activePage} onNav={setActivePage} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {activePage === "dashboard" && <DashboardPage onNav={setActivePage} />}
          {activePage === "products" && <ProductsPage onNav={setActivePage} />}
          {activePage === "categories" && <CategoriesPage onNav={setActivePage} />}
          {activePage === "orders" && <OrdersPage onNav={setActivePage} />}
          {activePage === "inventory" && <InventoryPage onNav={setActivePage} />}
          {activePage === "users" && <UsersPage onNav={setActivePage} />}
          {activePage === "promotions" && <PromotionsPage onNav={setActivePage} />}
          {activePage === "settings" && <SettingsPage onNav={setActivePage} />}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{globalStyle}</style>
      {renderPage()}
    </>
  );
}
