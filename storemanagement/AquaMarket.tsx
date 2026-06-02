import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
type PageId =
  | "home" | "products" | "search" | "detail"
  | "cart" | "checkout" | "success"
  | "profile" | "orders" | "reviews";

type Category = "appliances" | "food" | "beauty";
type OrderStatus = "processing" | "shipping" | "delivered" | "cancelled";
type PaymentMethod = "card" | "momo" | "bank" | "cod";
type ProfileTab = "info" | "address" | "security" | "notif";
type ReviewTab = "write" | "mine" | "pending";
type SortMode = "default" | "price-asc" | "price-desc" | "rating";

interface Product {
  id: number;
  name: string;
  category: Category;
  price: number;
  original: number | null;
  rating: number;
  reviews: number;
  emoji: string;
  desc: string;
}

interface CartItem { id: number; qty: number; }

interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  payment: string;
  items: { pid: number; qty: number }[];
}

interface Review {
  pid: number;
  rating: number;
  title: string;
  body: string;
  pros: string;
  cons: string;
  date: string;
  helpful: number;
}

/* ─────────────────────────────────────────────────────────────
   STATIC DATA
───────────────────────────────────────────────────────────── */
const PRODUCTS: Product[] = [
  { id: 1,  name: "Smart Air Purifier Pro",        category: "appliances", price: 89.99,  original: 119.99, rating: 4.8, reviews: 234,  emoji: "🌬️", desc: "HEPA H13 filter removes 99.97% of allergens. Ultra-quiet sleep mode, smart app control. Covers up to 500 sq ft." },
  { id: 2,  name: "High-Speed Blender X5",         category: "appliances", price: 64.99,  original: 84.99,  rating: 4.6, reviews: 189,  emoji: "🥤", desc: "2000W professional-grade motor. 8 preset programs including smoothie, soup, and ice crush. BPA-free 2L jug." },
  { id: 3,  name: "Robotic Vacuum Cleaner",        category: "appliances", price: 149.99, original: 199.99, rating: 4.9, reviews: 512,  emoji: "🤖", desc: "LiDAR navigation, auto-empty base, 180-min battery life. Works with Alexa & Google Assistant." },
  { id: 4,  name: "Electric Kettle 1.7L",          category: "appliances", price: 34.99,  original: null,   rating: 4.5, reviews: 98,   emoji: "☕", desc: "Precise temperature control (40–100°C). Keep-warm function for 2 hours. Fast 2200W boil. BPA-free." },
  { id: 5,  name: "Smart Rice Cooker",             category: "appliances", price: 54.99,  original: 69.99,  rating: 4.7, reviews: 303,  emoji: "🍚", desc: "Fuzzy logic AI adjusts cooking time. 10-cup capacity. Multiple modes: white rice, porridge, steam, slow cook." },
  { id: 6,  name: "Air Fryer 5.5L",               category: "appliances", price: 79.99,  original: 99.99,  rating: 4.8, reviews: 445,  emoji: "🍗", desc: "360° rapid air technology. 8 preset cooking modes. Dishwasher-safe basket. Up to 80% less fat." },
  { id: 7,  name: "Organic Green Tea (50 bags)",   category: "food",       price: 12.99,  original: null,   rating: 4.7, reviews: 867,  emoji: "🍵", desc: "Premium Japanese Sencha. Certified organic, no artificial flavors. Rich in antioxidants and L-theanine." },
  { id: 8,  name: "Cold Brew Coffee Pack",         category: "food",       price: 18.99,  original: 22.99,  rating: 4.6, reviews: 321,  emoji: "🧋", desc: "Single-origin Colombian beans. 200ml concentrate = 4 servings. Smooth, low-acid flavor profile." },
  { id: 9,  name: "Mixed Nut & Fruit Box",         category: "food",       price: 24.99,  original: 29.99,  rating: 4.5, reviews: 156,  emoji: "🥜", desc: "Premium assortment: almonds, cashews, walnuts, cranberries, mango. No added sugar. 500g resealable box." },
  { id: 10, name: "Sparkling Mineral Water (12pk)",category: "food",       price: 15.99,  original: null,   rating: 4.4, reviews: 78,   emoji: "💧", desc: "Natural mineral water from Vietnamese highlands. Lightly carbonated. No added sugar or artificial flavors." },
  { id: 11, name: "Artisan Dark Chocolate",        category: "food",       price: 9.99,   original: 12.99,  rating: 4.9, reviews: 634,  emoji: "🍫", desc: "72% cacao single-origin Ecuador. Vegan, gluten-free. Notes of berry and caramel. 100g bar." },
  { id: 12, name: "Kombucha Variety Pack",         category: "food",       price: 29.99,  original: 35.99,  rating: 4.6, reviews: 189,  emoji: "🫙", desc: "Live cultures, gut-friendly probiotics. 6 flavors: ginger-lemon, blueberry, mango, original, raspberry, peach." },
  { id: 13, name: "Vitamin C Brightening Serum",  category: "beauty",     price: 38.99,  original: 49.99,  rating: 4.8, reviews: 923,  emoji: "✨", desc: "20% Vitamin C + Ferulic Acid. Reduces dark spots, boosts collagen. Suitable for all skin types. 30ml." },
  { id: 14, name: "Hyaluronic Acid Moisturizer",  category: "beauty",     price: 29.99,  original: null,   rating: 4.7, reviews: 445,  emoji: "💧", desc: "Multi-weight hyaluronic acid for deep and surface hydration. Fragrance-free, dermatologist tested. 50ml." },
  { id: 15, name: "Retinol Night Cream",          category: "beauty",     price: 44.99,  original: 54.99,  rating: 4.6, reviews: 287,  emoji: "🌙", desc: "0.3% encapsulated retinol with peptides. Reduces fine lines overnight. Gentle enough for daily use. 50ml." },
  { id: 16, name: "SPF 50 Sunscreen Fluid",       category: "beauty",     price: 22.99,  original: 28.99,  rating: 4.9, reviews: 1205, emoji: "☀️", desc: "Lightweight fluid, invisible finish. UVA/UVB broad spectrum. Water-resistant 80 min. Reef-safe formula. 50ml." },
  { id: 17, name: "Niacinamide Toner",            category: "beauty",     price: 18.99,  original: null,   rating: 4.5, reviews: 312,  emoji: "🧴", desc: "10% Niacinamide + Zinc. Minimizes pores, controls oil, evens skin tone. Alcohol-free. 200ml." },
  { id: 18, name: "Lash & Brow Growth Serum",     category: "beauty",     price: 34.99,  original: 42.99,  rating: 4.7, reviews: 198,  emoji: "👁️", desc: "Peptide-enriched formula. Clinically shown to increase lash density by 25% in 4 weeks. 3ml precision applicator." },
];

const INITIAL_ORDERS: Order[] = [
  { id: "#AM72841", date: "May 20, 2025", status: "delivered",  payment: "Credit Card",   items: [{ pid: 13, qty: 1 }, { pid: 16, qty: 2 }] },
  { id: "#AM61023", date: "May 14, 2025", status: "shipping",   payment: "MoMo",          items: [{ pid: 3, qty: 1 }] },
  { id: "#AM55890", date: "May 5, 2025",  status: "processing", payment: "Bank Transfer", items: [{ pid: 7, qty: 3 }, { pid: 11, qty: 2 }, { pid: 9, qty: 1 }] },
  { id: "#AM48234", date: "Apr 28, 2025", status: "delivered",  payment: "COD",           items: [{ pid: 6, qty: 1 }, { pid: 8, qty: 2 }] },
  { id: "#AM43100", date: "Apr 15, 2025", status: "cancelled",  payment: "Credit Card",   items: [{ pid: 15, qty: 1 }] },
  { id: "#AM39876", date: "Apr 2, 2025",  status: "delivered",  payment: "MoMo",          items: [{ pid: 1, qty: 1 }, { pid: 17, qty: 1 }] },
  { id: "#AM31456", date: "Mar 20, 2025", status: "delivered",  payment: "Credit Card",   items: [{ pid: 2, qty: 1 }, { pid: 10, qty: 4 }] },
];

const MY_REVIEWS: Review[] = [
  { pid: 13, rating: 5, title: "Absolute game-changer for my skin!", body: "I have been using this serum for 2 months now and the difference is incredible. Dark spots have visibly faded and my skin looks so much brighter.", pros: "Visible results, lightweight, absorbs fast", cons: "A bit pricey but worth it", date: "May 18, 2025", helpful: 24 },
  { pid: 16, rating: 5, title: "Best sunscreen I've ever tried",      body: "No white cast, comfortable to wear all day. Reapplying is easy and it doesn't feel greasy at all. Would 100% recommend.",                        pros: "No white cast, reef-safe, water resistant", cons: "Wish it came in larger size", date: "May 10, 2025", helpful: 18 },
  { pid: 3,  rating: 4, title: "Great robot vacuum, almost perfect",  body: "Navigation is impressively smart and the auto-empty base is super convenient. Docks reliably every time. App can be slightly buggy.",             pros: "Great navigation, quiet, long battery",    cons: "App has minor bugs",              date: "Apr 30, 2025", helpful: 31 },
  { pid: 7,  rating: 5, title: "My daily morning ritual",             body: "Beautiful fragrance, calming, and you can really taste the quality of the leaves. Switched from coffee and feeling much better.",                   pros: "Great taste, calming, organic",           cons: "None honestly",                   date: "Apr 12, 2025", helpful: 15 },
  { pid: 11, rating: 5, title: "Best dark chocolate, period.",        body: "Rich, complex flavor with hints of berry. Not too sweet. Perfect for a treat without guilt. Vegan and gluten-free is a bonus.",                    pros: "Incredible flavor, ethically sourced",    cons: "Disappears too fast!",            date: "Mar 28, 2025", helpful: 9  },
];

const PENDING_PIDS = [6, 8, 17];
const STAR_LABELS = ["", "Terrible", "Bad", "Okay", "Good", "Excellent"];

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const fmt = (n: number) => `$${n.toFixed(2)}`;
const disc = (p: Product) => p.original ? Math.round((1 - p.price / p.original) * 100) : 0;
const subtotal = (cart: CartItem[]) =>
  cart.reduce((s, i) => s + (PRODUCTS.find(p => p.id === i.id)?.price ?? 0) * i.qty, 0);

function StarRow({ rating, size = "text-base" }: { rating: number; size?: string }) {
  return (
    <span className={size}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ color: i < Math.floor(rating) ? "#f59e0b" : "#e2e8f0" }}>★</span>
      ))}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   CSS-IN-JS GLOBAL STYLES (injected once)
───────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
:root{--teal:#0d9488;--teal-lt:#99f6e4;--teal-dk:#0f766e;--teal-xs:#f0fdfa;}
*{font-family:'DM Sans',sans-serif;box-sizing:border-box;}
h1,h2,h3,.serif{font-family:'Playfair Display',serif;}
::-webkit-scrollbar{width:6px;} ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px;}
input,select,textarea{border:1.5px solid #e2e8f0;border-radius:.6rem;padding:.55rem .85rem;width:100%;font-size:.9rem;background:#fff;outline:none;}
input:focus,select:focus,textarea:focus{border-color:var(--teal);box-shadow:0 0 0 3px rgba(13,148,136,.12);}
input[type=range]{-webkit-appearance:none;height:4px;border:none;border-radius:2px;background:linear-gradient(to right,var(--teal) 0%,var(--teal) 60%,#e2e8f0 60%);}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:var(--teal);cursor:pointer;box-shadow:0 2px 6px rgba(13,148,136,.4);}
input[type=radio]{width:auto;}input[type=checkbox]{width:auto;}
@keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
.fade-up{animation:fadeUp .5s ease forwards;}
.d1{animation-delay:.1s;opacity:0}.d2{animation-delay:.2s;opacity:0}.d3{animation-delay:.3s;opacity:0}
@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(3rem)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
@keyframes toastOut{from{opacity:1;transform:translateX(-50%) translateY(0)}to{opacity:0;transform:translateX(-50%) translateY(3rem)}}
`;

/* ─────────────────────────────────────────────────────────────
   SHARED UI COMPONENTS
───────────────────────────────────────────────────────────── */
function BtnTeal({ children, onClick, className = "", style = {} }: { children: React.ReactNode; onClick?: () => void; className?: string; style?: React.CSSProperties }) {
  return (
    <button onClick={onClick} className={"btn-teal " + className}
      style={{ background: "var(--teal)", color: "#fff", borderRadius: 9999, padding: ".6rem 1.4rem", fontWeight: 600, fontSize: ".875rem", border: "none", cursor: "pointer", transition: "all .2s", ...style }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--teal-dk)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "var(--teal)"; }}>
      {children}
    </button>
  );
}

function BtnOutline({ children, onClick, className = "", danger = false }: { children: React.ReactNode; onClick?: () => void; className?: string; danger?: boolean }) {
  const [hov, setHov] = useState(false);
  const bc = danger ? "#ef4444" : "var(--teal)";
  return (
    <button onClick={onClick} className={className}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ border: `2px solid ${bc}`, color: hov ? "#fff" : bc, borderRadius: 9999, padding: ".5rem 1.4rem", fontWeight: 600, fontSize: ".875rem", background: hov ? bc : "transparent", cursor: "pointer", transition: "all .2s" }}>
      {children}
    </button>
  );
}

function Badge({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <span style={{ display: "inline-block", background: "var(--teal-lt)", color: "var(--teal-dk)", borderRadius: 9999, padding: ".15rem .65rem", fontSize: ".72rem", fontWeight: 600, ...style }}>
      {children}
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   PRODUCT CARD
───────────────────────────────────────────────────────────── */
function ProductCard({ p, onOpen, onAdd }: { p: Product; onOpen: (id: number) => void; onAdd: (id: number) => void }) {
  const d = disc(p);
  return (
    <div onClick={() => onOpen(p.id)} style={{ background: "#fff", borderRadius: "1.25rem", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,.06)", cursor: "pointer", transition: "all .25s" }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 30px rgba(13,148,136,.18)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,.06)"; }}>
      <div style={{ background: "var(--teal-xs)", height: 160, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "4.5rem", position: "relative" }}>
        {p.emoji}
        {d > 0 && <span style={{ position: "absolute", top: 8, right: 8, background: "#fef9c3", color: "#854d0e", borderRadius: 9999, padding: ".15rem .6rem", fontSize: ".72rem", fontWeight: 600 }}>-{d}%</span>}
      </div>
      <div style={{ padding: "1rem" }}>
        <Badge>{p.category}</Badge>
        <p style={{ fontWeight: 600, fontSize: ".875rem", lineHeight: 1.4, margin: ".3rem 0 .25rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.name}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
          <StarRow rating={p.rating} size="text-xs" />
          <span style={{ fontSize: ".75rem", color: "#94a3b8" }}>({p.reviews})</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: ".875rem", color: "var(--teal)" }}>{fmt(p.price)}</span>
            {p.original && <span style={{ textDecoration: "line-through", fontSize: ".75rem", color: "#94a3b8", marginLeft: 4 }}>{fmt(p.original)}</span>}
          </div>
          <button onClick={e => { e.stopPropagation(); onAdd(p.id); }}
            style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--teal)", color: "#fff", border: "none", cursor: "pointer", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   QR CANVAS MODAL
───────────────────────────────────────────────────────────── */
function QRModal({ method, total, onClose, onConfirm }: { method: PaymentMethod; total: number; onClose: () => void; onConfirm: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMomo = method === "momo";

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const size = 180; const module = 6; const modules = 30; const seed = isMomo ? 42 : 77;
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, size, size);
    const rand = (x: number, y: number) => ((x * 1234567 + y * 7654321 + seed * 999983) % 1000) / 1000;
    const color = isMomo ? "#a21caf" : "#0d9488";
    for (let r = 0; r < modules; r++) {
      for (let c = 0; c < modules; c++) {
        const inF = (r < 7 && c < 7) || (r < 7 && c > modules - 8) || (r > modules - 8 && c < 7);
        if (inF) {
          const edge = r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
          const inside = r > 0 && r < 6 && c > 0 && c < 6 && !edge;
          ctx.fillStyle = inside ? "#fff" : color;
          ctx.fillRect(c * module, r * module, module, module);
        } else if (rand(r, c) > 0.5) {
          ctx.fillStyle = color; ctx.fillRect(c * module, r * module, module, module);
        }
      }
    }
    ctx.fillStyle = "#fff"; ctx.fillRect(70, 70, 40, 40);
    ctx.font = "24px serif"; ctx.fillText(isMomo ? "💜" : "🏦", 72, 98);
  }, [isMomo]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "1.5rem", padding: "2rem", width: "90%", maxWidth: 380, boxShadow: "0 20px 60px rgba(0,0,0,.2)", textAlign: "center" }}>
        <h3 className="serif" style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: 4 }}>{isMomo ? "💜 Pay with MoMo" : "🏦 Bank Transfer"}</h3>
        <p style={{ color: "#64748b", fontSize: ".875rem", marginBottom: "1rem" }}>{isMomo ? "Open MoMo app → scan QR → confirm" : "Open banking app → scan QR → transfer"}</p>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
          <div style={{ padding: "0.75rem", border: `4px solid var(--teal)`, borderRadius: "1rem" }}>
            <canvas ref={canvasRef} width={180} height={180} />
          </div>
        </div>
        <div style={{ background: "var(--teal-xs)", borderRadius: "0.75rem", padding: "0.75rem", marginBottom: "1rem" }}>
          <p style={{ fontSize: ".75rem", color: "#64748b" }}>Amount to Pay</p>
          <p className="serif" style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--teal)" }}>{fmt(total)}</p>
        </div>
        <p style={{ fontSize: ".75rem", color: "#94a3b8", marginBottom: "1rem" }}>After scanning, click "I've Paid" below to confirm.</p>
        <BtnTeal onClick={onConfirm} style={{ width: "100%", padding: "0.75rem" }}>I've Paid ✓</BtnTeal>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TOAST
───────────────────────────────────────────────────────────── */
function Toast({ msg }: { msg: string }) {
  return (
    <div style={{ position: "fixed", bottom: "2rem", left: "50%", transform: "translateX(-50%)", background: "var(--teal)", color: "#fff", padding: ".75rem 1.75rem", borderRadius: 9999, fontWeight: 600, zIndex: 300, animation: "toastIn .35s ease forwards", whiteSpace: "nowrap", boxShadow: "0 8px 24px rgba(13,148,136,.4)" }}>
      ✓ {msg}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGES
══════════════════════════════════════════════════════════ */

/* ── HOME ── */
function HomePage({ goto, onAdd }: { goto: (p: PageId, id?: number) => void; onAdd: (id: number) => void }) {
  const featured = PRODUCTS.filter(p => p.rating >= 4.7).slice(0, 4);
  const catCards = [
    { cat: "appliances" as Category, label: "Home Appliances", sub: "Air purifiers, blenders & more", emoji: "🏠", grad: "linear-gradient(135deg,#0d9488,#0f766e)" },
    { cat: "food"       as Category, label: "Food & Drinks",   sub: "Organic, gourmet & everyday",   emoji: "🍱", grad: "linear-gradient(135deg,#0891b2,#0e7490)" },
    { cat: "beauty"     as Category, label: "Beauty & Cosmetics", sub: "Skincare, makeup & wellness", emoji: "💄", grad: "linear-gradient(135deg,#0f766e,#115e59)" },
  ];
  const stats = [["500+","Products"],["50K+","Customers"],["4.9★","Avg Rating"],["24h","Delivery"]];

  return (
    <div>
      {/* Hero */}
      <section style={{ background: "linear-gradient(135deg,#0d9488 0%,#0f766e 50%,#134e4a 100%)", minHeight: 520, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: .08, backgroundImage: `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><circle cx='10' cy='10' r='1.5' fill='white'/></svg>")` }} />
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "5rem 1.5rem", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "2.5rem", position: "relative", zIndex: 1 }}>
          <div className="fade-up" style={{ flex: 1, minWidth: 280, color: "#fff" }}>
            <Badge style={{ background: "rgba(255,255,255,.2)", color: "#fff", marginBottom: "1rem", display: "inline-block" }}>✨ New Arrivals Every Week</Badge>
            <h1 className="serif" style={{ fontSize: "clamp(2.5rem,5vw,4rem)", fontWeight: 700, lineHeight: 1.15, marginBottom: "1rem" }}>
              Fresh Finds<br /><span style={{ color: "var(--teal-lt)" }}>Delivered</span> Daily
            </h1>
            <p style={{ color: "#99f6e4", fontSize: "1.1rem", marginBottom: "2rem", maxWidth: 420 }}>Home appliances, gourmet food & drinks, and premium beauty products — all in one place.</p>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <BtnTeal onClick={() => goto("products")} style={{ background: "#fff", color: "var(--teal-dk)" }}>Shop Now</BtnTeal>
              <BtnOutline onClick={() => goto("products")}><span style={{ color: "#fff" }}>View Deals</span></BtnOutline>
            </div>
          </div>
          <div className="fade-up d2" style={{ flex: 1, display: "flex", justifyContent: "center", minWidth: 220 }}>
            <div style={{ position: "relative" }}>
              <div style={{ width: 224, height: 224, borderRadius: "1.5rem", background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 20px 60px rgba(0,0,0,.3)" }}>
                <span style={{ fontSize: "4.5rem" }}>🛍️</span>
                <span className="serif" style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 600 }}>500+ Products</span>
              </div>
              {[{ emoji: "🏠", label: "Appliances", top: -24, right: -32 }, { emoji: "💄", label: "Beauty", bottom: -24, left: -32 }].map((f, i) => (
                <div key={i} style={{ position: "absolute", width: 96, height: 96, borderRadius: "1rem", background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.25)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", top: f.top, right: (f as any).right, bottom: (f as any).bottom, left: (f as any).left }}>
                  <span style={{ fontSize: "2rem" }}>{f.emoji}</span>
                  <span style={{ color: "#fff", fontSize: ".75rem", fontWeight: 500, marginTop: 4 }}>{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", overflow: "hidden", lineHeight: 0 }}>
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ height: 60, width: "100%", display: "block" }}><path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#f8fafc" /></svg>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: "2.5rem 1.5rem", background: "#f8fafc" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: "1.25rem" }}>
          {stats.map(([v, l], i) => (
            <div key={i} style={{ background: "#fff", borderRadius: "1rem", padding: "1.25rem", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,.04)" }}>
              <div className="serif" style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--teal)" }}>{v}</div>
              <div style={{ fontSize: ".875rem", color: "#64748b", marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: "3.5rem 1.5rem", background: "#f8fafc" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <h2 className="serif" style={{ fontSize: "2rem", fontWeight: 700, textAlign: "center", marginBottom: "0.5rem" }}>Shop by Category</h2>
          <p style={{ color: "#64748b", textAlign: "center", marginBottom: "2.5rem" }}>Find exactly what you need</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "1.25rem" }}>
            {catCards.map(c => (
              <button key={c.cat} onClick={() => goto("products", undefined)} style={{ background: c.grad, borderRadius: "1.5rem", padding: "2rem", textAlign: "left", border: "none", cursor: "pointer", minHeight: 180, position: "relative", overflow: "hidden", transition: "transform .2s" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-4px)")} onMouseLeave={e => (e.currentTarget.style.transform = "")}>
                <span style={{ fontSize: "3.5rem", display: "block", marginBottom: "0.75rem" }}>{c.emoji}</span>
                <h3 className="serif" style={{ fontSize: "1.35rem", fontWeight: 700, color: "#fff" }}>{c.label}</h3>
                <p style={{ color: "rgba(255,255,255,.75)", fontSize: ".875rem", marginTop: "0.25rem" }}>{c.sub}</p>
                <div style={{ position: "absolute", bottom: -16, right: -16, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,.1)" }} />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section style={{ padding: "3.5rem 1.5rem", background: "#fff" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2rem" }}>
            <div>
              <h2 className="serif" style={{ fontSize: "2rem", fontWeight: 700 }}>Featured Products</h2>
              <p style={{ color: "#64748b", marginTop: "0.25rem" }}>Handpicked just for you</p>
            </div>
            <BtnOutline onClick={() => goto("products")}>View All</BtnOutline>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "1.25rem" }}>
            {featured.map(p => <ProductCard key={p.id} p={p} onOpen={id => goto("detail", id)} onAdd={onAdd} />)}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section style={{ padding: "3.5rem 1.5rem", background: "#f8fafc" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ background: "linear-gradient(135deg,#0d9488,#134e4a)", borderRadius: "1.5rem", padding: "4rem 2rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, opacity: .05, backgroundImage: "repeating-linear-gradient(45deg,#fff,#fff 1px,transparent 1px,transparent 10px)" }} />
            <h2 className="serif" style={{ fontSize: "2.25rem", fontWeight: 700, color: "#fff", marginBottom: "0.75rem", position: "relative" }}>Get 20% Off Your First Order</h2>
            <p style={{ color: "#99f6e4", marginBottom: "1.5rem", position: "relative" }}>Use code <strong style={{ color: "#fff" }}>AQUA20</strong> at checkout</p>
            <BtnTeal onClick={() => goto("products")} style={{ background: "#fff", color: "var(--teal-dk)", position: "relative" }}>Shop Now & Save</BtnTeal>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#0f172a", color: "#94a3b8", padding: "2.5rem 1.5rem", fontSize: ".875rem" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: "2rem", justifyContent: "space-between" }}>
          <div><span className="serif" style={{ color: "#fff", fontSize: "1.1rem" }}>AquaMarket</span><p style={{ marginTop: 4 }}>Fresh finds delivered daily.</p></div>
          <div style={{ display: "flex", gap: "3rem" }}>
            {[["Shop", ["Appliances","Food & Drinks","Beauty"]], ["Help", ["FAQ","Returns","Contact"]]].map(([title, links]) => (
              <div key={title as string}>
                <p style={{ color: "#fff", fontWeight: 600, marginBottom: 8 }}>{title as string}</p>
                {(links as string[]).map(l => <p key={l} style={{ cursor: "pointer", marginTop: 4 }} onMouseEnter={e => ((e.target as HTMLElement).style.color = "#5eead4")} onMouseLeave={e => ((e.target as HTMLElement).style.color = "#94a3b8")}>{l}</p>)}
              </div>
            ))}
          </div>
        </div>
        <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: ".75rem", color: "#475569" }}>© 2025 AquaMarket. All rights reserved.</p>
      </footer>
    </div>
  );
}

/* ── PRODUCTS PAGE ── */
function ProductsPage({ goto, onAdd, initCategory }: { goto: (p: PageId, id?: number) => void; onAdd: (id: number) => void; initCategory: Category | "all" }) {
  const [category, setCategory] = useState<Category | "all">(initCategory);
  const [maxPrice, setMaxPrice] = useState(200);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<SortMode>("default");

  const filtered = PRODUCTS.filter(p =>
    (category === "all" || p.category === category) &&
    p.price <= maxPrice && p.rating >= minRating
  ).sort((a, b) => sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : sort === "rating" ? b.rating - a.rating : 0);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
        {/* Sidebar */}
        <aside style={{ width: 240, flexShrink: 0 }}>
          <div style={{ background: "#fff", borderRadius: "1.25rem", padding: "1.25rem", boxShadow: "0 2px 12px rgba(0,0,0,.05)", position: "sticky", top: 76 }}>
            <h3 className="serif" style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "1.25rem" }}>Filters</h3>

            <div style={{ marginBottom: "1.5rem" }}>
              <p style={{ fontWeight: 600, fontSize: ".875rem", color: "#374151", marginBottom: "0.5rem" }}>Category</p>
              {(["all","appliances","food","beauty"] as const).map(c => (
                <label key={c} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 6 }}>
                  <input type="radio" name="cat" checked={category === c} onChange={() => setCategory(c)} style={{ accentColor: "var(--teal)", width: 16, height: 16 }} />
                  <span style={{ fontSize: ".875rem" }}>{c === "all" ? "All" : c === "appliances" ? "Home Appliances" : c === "food" ? "Food & Drinks" : "Beauty & Cosmetics"}</span>
                </label>
              ))}
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <p style={{ fontWeight: 600, fontSize: ".875rem", color: "#374151", marginBottom: "0.5rem" }}>
                Max Price: <span style={{ color: "var(--teal)", fontWeight: 700 }}>${maxPrice}</span>
              </p>
              <input type="range" min={5} max={200} value={maxPrice} onChange={e => setMaxPrice(+e.target.value)} />
            </div>

            <div style={{ marginBottom: "1.25rem" }}>
              <p style={{ fontWeight: 600, fontSize: ".875rem", color: "#374151", marginBottom: "0.5rem" }}>Min Rating</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {([0, 4, 4.5] as const).map(r => (
                  <button key={r} onClick={() => setMinRating(r)}
                    style={{ padding: ".3rem .75rem", borderRadius: 9999, border: "1.5px solid", borderColor: minRating === r ? "var(--teal)" : "#e2e8f0", background: minRating === r ? "var(--teal-xs)" : "#fff", color: minRating === r ? "var(--teal-dk)" : "#64748b", fontSize: ".75rem", fontWeight: 500, cursor: "pointer" }}>
                    {r === 0 ? "All" : `${r}+ ★`}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p style={{ fontWeight: 600, fontSize: ".875rem", color: "#374151", marginBottom: "0.5rem" }}>Sort By</p>
              <select value={sort} onChange={e => setSort(e.target.value as SortMode)} style={{ fontSize: ".875rem" }}>
                <option value="default">Default</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="rating">Best Rated</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Grid */}
        <main style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <h2 className="serif" style={{ fontSize: "1.5rem", fontWeight: 700 }}>
              {category === "all" ? "All Products" : category === "appliances" ? "Home Appliances" : category === "food" ? "Food & Drinks" : "Beauty & Cosmetics"}
            </h2>
            <span style={{ color: "#64748b", fontSize: ".875rem" }}>{filtered.length} product{filtered.length !== 1 ? "s" : ""}</span>
          </div>
          {filtered.length === 0
            ? <p style={{ color: "#94a3b8", textAlign: "center", padding: "4rem" }}>No products match your filters.</p>
            : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "1.25rem" }}>
                {filtered.map(p => <ProductCard key={p.id} p={p} onOpen={id => goto("detail", id)} onAdd={onAdd} />)}
              </div>}
        </main>
      </div>
    </div>
  );
}

/* ── SEARCH PAGE ── */
function SearchPage({ term: initTerm, goto, onAdd }: { term: string; goto: (p: PageId, id?: number) => void; onAdd: (id: number) => void }) {
  const [term, setTerm] = useState(initTerm);
  const [search, setSearch] = useState(initTerm);
  const results = PRODUCTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));
  const quick = ["blender","serum","coffee","moisturizer"];
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
          <h2 className="serif" style={{ fontSize: "1.75rem", fontWeight: 700 }}>Search Results</h2>
          <Badge>{results.length} result{results.length !== 1 ? "s" : ""}</Badge>
        </div>
        {search && <p style={{ color: "#64748b", fontSize: ".875rem" }}>Showing results for "{search}"</p>}
        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", maxWidth: 480 }}>
          <input value={term} onChange={e => setTerm(e.target.value)} onKeyDown={e => e.key === "Enter" && setSearch(term)} placeholder="Search again…" style={{ flex: 1 }} />
          <BtnTeal onClick={() => setSearch(term)}>Search</BtnTeal>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.75rem", alignItems: "center" }}>
          <span style={{ fontSize: ".875rem", color: "#64748b" }}>Quick:</span>
          {quick.map(q => (
            <button key={q} onClick={() => { setTerm(q); setSearch(q); }}
              style={{ padding: ".3rem .85rem", borderRadius: 9999, border: "1.5px solid #e2e8f0", fontSize: ".8rem", fontWeight: 500, cursor: "pointer", background: "#fff" }}>
              {q}
            </button>
          ))}
        </div>
      </div>
      {results.length === 0
        ? <div style={{ textAlign: "center", padding: "5rem 1rem" }}>
            <span style={{ fontSize: "4rem" }}>🔍</span>
            <p className="serif" style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "1rem", marginBottom: "0.5rem" }}>No results found</p>
            <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>Try different keywords or browse our categories</p>
            <BtnTeal onClick={() => goto("products")}>Browse All Products</BtnTeal>
          </div>
        : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "1.25rem" }}>
            {results.map(p => <ProductCard key={p.id} p={p} onOpen={id => goto("detail", id)} onAdd={onAdd} />)}
          </div>}
    </div>
  );
}

/* ── PRODUCT DETAIL ── */
function DetailPage({ productId, goto, onAdd }: { productId: number; goto: (p: PageId, id?: number) => void; onAdd: (id: number) => void }) {
  const [qty, setQty] = useState(1);
  const p = PRODUCTS.find(x => x.id === productId)!;
  if (!p) return null;
  const d = disc(p);
  const related = PRODUCTS.filter(r => r.category === p.category && r.id !== p.id).slice(0, 4);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".875rem", color: "#64748b", marginBottom: "1.5rem" }}>
        {[["home","Home"],["products","Products"]].map(([pg, label]) => (
          <span key={pg} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ cursor: "pointer", color: "var(--teal)" }} onClick={() => goto(pg as PageId)}>{label}</span>
            <span>/</span>
          </span>
        ))}
        <span style={{ color: "#1e293b", fontWeight: 500 }}>{p.name}</span>
      </div>

      <div style={{ display: "flex", gap: "2.5rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ background: "var(--teal-xs)", borderRadius: "1.5rem", height: 380, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8rem" }}>{p.emoji}</div>
        </div>
        <div style={{ flex: 1, minWidth: 280 }}>
          <Badge style={{ marginBottom: "0.5rem" }}>{p.category}</Badge>
          <h1 className="serif" style={{ fontSize: "1.85rem", fontWeight: 700, margin: ".5rem 0 .75rem" }}>{p.name}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.25rem" }}>
            <StarRow rating={p.rating} size="text-lg" />
            <span style={{ fontSize: ".875rem", color: "#64748b" }}>{p.rating} ({p.reviews} reviews)</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: "1.25rem" }}>
            <span className="serif" style={{ fontSize: "2rem", fontWeight: 700, color: "var(--teal)" }}>{fmt(p.price)}</span>
            {p.original && <span style={{ textDecoration: "line-through", color: "#94a3b8", fontSize: "1.1rem" }}>{fmt(p.original)}</span>}
            {d > 0 && <span style={{ background: "#fef9c3", color: "#854d0e", borderRadius: 9999, padding: ".15rem .65rem", fontSize: ".75rem", fontWeight: 600 }}>-{d}% OFF</span>}
          </div>
          <p style={{ color: "#4b5563", lineHeight: 1.7, marginBottom: "1.5rem" }}>{p.desc}</p>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
            <span style={{ fontWeight: 600, fontSize: ".875rem" }}>Quantity</span>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {[-1,1].map((d, i) => (
                <button key={i} onClick={() => setQty(q => Math.max(1, q + d))}
                  style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #cbd5e1", background: "#fff", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  {d < 0 ? "−" : "+"}
                </button>
              ))}
              <span style={{ width: 32, textAlign: "center", fontWeight: 700, fontSize: "1rem" }}>{qty}</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <BtnTeal onClick={() => { for (let i = 0; i < qty; i++) onAdd(p.id); }} style={{ flex: 1, padding: "0.75rem" }}>Add to Cart 🛒</BtnTeal>
            <BtnOutline onClick={() => { for (let i = 0; i < qty; i++) onAdd(p.id); goto("cart"); }} className="" style={{ flex: 1 } as any}>Buy Now</BtnOutline>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.75rem" }}>
            {[["🚚","Free Shipping"],["↩️","Easy Returns"],["🔒","Secure Pay"]].map(([icon,label]) => (
              <div key={label} style={{ background: "var(--teal-xs)", borderRadius: "0.75rem", padding: "0.75rem", textAlign: "center", fontSize: ".8rem" }}>
                <span style={{ fontSize: "1.25rem", display: "block" }}>{icon}</span>{label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div style={{ marginTop: "3.5rem" }}>
          <h2 className="serif" style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>You Might Also Like</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "1.25rem" }}>
            {related.map(r => <ProductCard key={r.id} p={r} onOpen={id => goto("detail", id)} onAdd={onAdd} />)}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── CART ── */
function CartPage({ cart, onUpdate, onRemove, goto }: { cart: CartItem[]; onUpdate: (id: number, d: number) => void; onRemove: (id: number) => void; goto: (p: PageId) => void }) {
  const sub = subtotal(cart);
  const tax = sub * 0.1;
  const total = sub + tax;
  if (cart.length === 0) return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "5rem 1.5rem", textAlign: "center" }}>
      <span style={{ fontSize: "5rem" }}>🛒</span>
      <p className="serif" style={{ fontSize: "1.75rem", fontWeight: 700, marginTop: "1rem", marginBottom: "0.5rem" }}>Your cart is empty</p>
      <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>Looks like you haven't added anything yet</p>
      <BtnTeal onClick={() => goto("products")}>Start Shopping</BtnTeal>
    </div>
  );
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
      <h1 className="serif" style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "2rem" }}>Shopping Cart</h1>
      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {cart.map(item => {
            const p = PRODUCTS.find(x => x.id === item.id)!;
            return (
              <div key={item.id} style={{ background: "#fff", borderRadius: "1.25rem", padding: "1rem", boxShadow: "0 2px 10px rgba(0,0,0,.05)", display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.75rem" }}>
                <div style={{ width: 64, height: 64, borderRadius: "0.75rem", background: "var(--teal-xs)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", flexShrink: 0 }}>{p.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: ".9rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                  <p style={{ fontSize: ".75rem", color: "#94a3b8", marginTop: 2 }}>{p.category}</p>
                  <p style={{ fontWeight: 700, fontSize: ".9rem", color: "var(--teal)", marginTop: 4 }}>{fmt(p.price * item.qty)}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {[-1,1].map((d, i) => <button key={i} onClick={() => onUpdate(p.id, d)} style={{ width: 30, height: 30, borderRadius: "50%", border: "1.5px solid #cbd5e1", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{d < 0 ? "−" : "+"}</button>)}
                  <span style={{ width: 24, textAlign: "center", fontWeight: 700 }}>{item.qty}</span>
                </div>
                <button onClick={() => onRemove(p.id)} style={{ width: 32, height: 32, borderRadius: "50%", background: "#f1f5f9", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: ".85rem" }}>✕</button>
              </div>
            );
          })}
        </div>
        <div style={{ width: 280, flexShrink: 0 }}>
          <div style={{ background: "#fff", borderRadius: "1.25rem", padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,.06)", position: "sticky", top: 76 }}>
            <h3 className="serif" style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "1.25rem" }}>Order Summary</h3>
            {[["Subtotal", fmt(sub)],["Shipping","FREE"],["Tax (10%)", fmt(tax)]].map(([l,v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: ".875rem", marginBottom: "0.5rem" }}>
                <span style={{ color: "#64748b" }}>{l}</span>
                <span style={{ fontWeight: 500, color: l === "Shipping" ? "#16a34a" : undefined }}>{v}</span>
              </div>
            ))}
            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "1rem", marginTop: "0.5rem", display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "1.1rem" }}>
              <span>Total</span><span style={{ color: "var(--teal)" }}>{fmt(total)}</span>
            </div>
            <BtnTeal onClick={() => goto("checkout")} style={{ width: "100%", marginTop: "1.25rem", padding: "0.75rem" }}>Proceed to Checkout</BtnTeal>
            <BtnOutline onClick={() => goto("products")} className="" style={{ width: "100%", marginTop: "0.5rem", padding: "0.6rem" } as any}>Continue Shopping</BtnOutline>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── CHECKOUT ── */
function CheckoutPage({ cart, goto, onPlaceOrder }: { cart: CartItem[]; goto: (p: PageId) => void; onPlaceOrder: (method: PaymentMethod) => void }) {
  const [payment, setPayment] = useState<PaymentMethod>("card");
  const [showQR, setShowQR] = useState(false);
  const sub = subtotal(cart);
  const tax = sub * 0.1;
  const total = sub + tax;

  const payOpts: { id: PaymentMethod; label: string; sub: string; icon: string }[] = [
    { id: "card", label: "Credit / Debit Card", sub: "Visa, Mastercard, JCB", icon: "💳" },
    { id: "momo", label: "MoMo",                sub: "Scan QR to pay instantly", icon: "💜" },
    { id: "bank", label: "Bank Transfer",        sub: "Scan QR via banking app",  icon: "🏦" },
    { id: "cod",  label: "Cash on Delivery",     sub: "Pay when you receive",      icon: "📦" },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 1.5rem" }}>
      {showQR && <QRModal method={payment} total={total} onClose={() => setShowQR(false)} onConfirm={() => { setShowQR(false); onPlaceOrder(payment); }} />}
      <h1 className="serif" style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>Checkout</h1>
      <p style={{ color: "#64748b", marginBottom: "2rem" }}>Complete your order details below</p>

      {/* Steps */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "2.5rem" }}>
        {[["1","Shipping","var(--teal)"],["2","Payment","var(--teal)"],["3","Review","#e2e8f0"]].map(([n,l,bg],i) => (
          <span key={n} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {i > 0 && <span style={{ flex: 1, height: 2, width: 40, background: "#e2e8f0" }} />}
            <span style={{ width: 32, height: 32, borderRadius: "50%", background: bg, color: bg === "#e2e8f0" ? "#94a3b8" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: ".875rem", flexShrink: 0 }}>{n}</span>
            <span style={{ fontSize: ".875rem", fontWeight: 600, color: bg === "#e2e8f0" ? "#94a3b8" : "var(--teal)" }}>{l}</span>
          </span>
        ))}
      </div>

      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 280, display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Shipping */}
          <div style={{ background: "#fff", borderRadius: "1.25rem", padding: "1.5rem", boxShadow: "0 2px 10px rgba(0,0,0,.05)" }}>
            <h3 className="serif" style={{ fontWeight: 700, fontSize: "1.15rem", marginBottom: "1.25rem" }}>Shipping Information</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {[["First Name","text","John"],["Last Name","text","Doe"],["Email","email","john@example.com","2"],["Phone","tel","+84 912 345 678","2"],["Address","text","123 Main Street","2"],["City","text","Ho Chi Minh City"],["Zip Code","text","70000"]].map(([label, type, ph, span]) => (
                <div key={label as string} style={{ gridColumn: span ? `span ${span}` : undefined }}>
                  <label style={{ fontSize: ".75rem", fontWeight: 600, color: "#4b5563", display: "block", marginBottom: 4 }}>{label as string}</label>
                  <input type={type as string} placeholder={ph as string} />
                </div>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div style={{ background: "#fff", borderRadius: "1.25rem", padding: "1.5rem", boxShadow: "0 2px 10px rgba(0,0,0,.05)" }}>
            <h3 className="serif" style={{ fontWeight: 700, fontSize: "1.15rem", marginBottom: "1.25rem" }}>Payment Method</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {payOpts.map(opt => (
                <label key={opt.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem", borderRadius: "0.75rem", border: `2px solid ${payment === opt.id ? "var(--teal)" : "#e2e8f0"}`, background: payment === opt.id ? "var(--teal-xs)" : "#fff", cursor: "pointer", transition: ".2s" }}>
                  <input type="radio" name="pay" value={opt.id} checked={payment === opt.id} onChange={() => setPayment(opt.id)} style={{ accentColor: "var(--teal)", width: 16, height: 16 }} />
                  <span style={{ fontSize: "1.5rem" }}>{opt.icon}</span>
                  <div style={{ flex: 1 }}><p style={{ fontWeight: 600, fontSize: ".9rem" }}>{opt.label}</p><p style={{ fontSize: ".75rem", color: "#64748b" }}>{opt.sub}</p></div>
                  {opt.id === "momo" && <Badge style={{ background: "#fdf2f8", color: "#9d174d" }}>Popular</Badge>}
                </label>
              ))}

              {payment === "card" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", paddingLeft: "0.5rem" }}>
                  <div style={{ gridColumn: "span 2" }}><label style={{ fontSize: ".75rem", fontWeight: 600, color: "#4b5563", display: "block", marginBottom: 4 }}>Card Number</label><input type="text" placeholder="1234 5678 9012 3456" /></div>
                  <div><label style={{ fontSize: ".75rem", fontWeight: 600, color: "#4b5563", display: "block", marginBottom: 4 }}>Expiry</label><input type="text" placeholder="MM / YY" /></div>
                  <div><label style={{ fontSize: ".75rem", fontWeight: 600, color: "#4b5563", display: "block", marginBottom: 4 }}>CVV</label><input type="text" placeholder="•••" /></div>
                </div>
              )}

              {(payment === "momo" || payment === "bank") && (
                <BtnTeal onClick={() => setShowQR(true)} style={{ width: "100%", padding: "0.75rem" }}>
                  {payment === "momo" ? "💜 Tap to View MoMo QR Code" : "🏦 Tap to View Bank Transfer QR"}
                </BtnTeal>
              )}
            </div>
          </div>
        </div>

        {/* Summary sidebar */}
        <div style={{ width: 280, flexShrink: 0 }}>
          <div style={{ background: "#fff", borderRadius: "1.25rem", padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,.06)", position: "sticky", top: 76 }}>
            <h3 className="serif" style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "1rem" }}>Your Order</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: 200, overflowY: "auto", marginBottom: "1rem" }}>
              {cart.map(item => {
                const p = PRODUCTS.find(x => x.id === item.id)!;
                return <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "1.25rem" }}>{p.emoji}</span>
                  <span style={{ flex: 1, fontSize: ".8rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name} ×{item.qty}</span>
                  <span style={{ fontSize: ".8rem", fontWeight: 700, color: "var(--teal)" }}>{fmt(p.price * item.qty)}</span>
                </div>;
              })}
            </div>
            {[["Subtotal",fmt(sub)],["Shipping","FREE"],["Tax",fmt(tax)]].map(([l,v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: ".875rem", marginBottom: "0.4rem" }}>
                <span style={{ color: "#64748b" }}>{l}</span>
                <span style={{ color: l === "Shipping" ? "#16a34a" : undefined, fontWeight: 500 }}>{v}</span>
              </div>
            ))}
            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "0.75rem", marginTop: "0.25rem", display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "1.1rem" }}>
              <span>Total</span><span style={{ color: "var(--teal)" }}>{fmt(total)}</span>
            </div>
            <BtnTeal onClick={() => { if (payment === "momo" || payment === "bank") { setShowQR(true); } else { onPlaceOrder(payment); } }} style={{ width: "100%", marginTop: "1.25rem", padding: "0.75rem" }}>Place Order ✓</BtnTeal>
            <p style={{ textAlign: "center", fontSize: ".75rem", color: "#94a3b8", marginTop: "0.75rem" }}>🔒 Secured by 256-bit SSL</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── ORDER SUCCESS ── */
function SuccessPage({ orderId, cart, goto }: { orderId: string; cart: CartItem[]; goto: (p: PageId) => void }) {
  const total = subtotal(cart) * 1.1;
  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "5rem 1.5rem", textAlign: "center" }}>
      <div style={{ width: 96, height: 96, borderRadius: "50%", background: "var(--teal-xs)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", margin: "0 auto 1.5rem" }}>✅</div>
      <h1 className="serif" style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>Order Placed!</h1>
      <p style={{ color: "#64748b", marginBottom: "0.5rem" }}>Thank you for your purchase.</p>
      <p style={{ color: "#64748b", marginBottom: "2rem" }}>Your order <strong style={{ color: "#1e293b" }}>{orderId}</strong> is being processed and will be delivered within 24 hours.</p>
      <div style={{ background: "#fff", borderRadius: "1.25rem", padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,.06)", textAlign: "left", marginBottom: "2rem" }}>
        <p style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: "0.75rem" }}>Order Details</p>
        {cart.map(item => { const p = PRODUCTS.find(x => x.id === item.id)!; return <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: ".875rem", marginBottom: "0.4rem" }}><span>{p.emoji} {p.name} ×{item.qty}</span><span style={{ fontWeight: 600 }}>{fmt(p.price * item.qty)}</span></div>; })}
        <div style={{ borderTop: "1px solid #f1f5f9", marginTop: "0.75rem", paddingTop: "0.75rem", display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
          <span>Total Paid</span><span style={{ color: "var(--teal)" }}>{fmt(total)}</span>
        </div>
      </div>
      <BtnTeal onClick={() => goto("home")} style={{ padding: "0.75rem 2.5rem" }}>Back to Home</BtnTeal>
    </div>
  );
}

/* ── PROFILE ── */
function ProfilePage({ goto }: { goto: (p: PageId) => void }) {
  const [tab, setTab] = useState<ProfileTab>("info");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: "John", lastName: "Doe", email: "john.doe@email.com", phone: "+84 912 345 678", dob: "1992-01-15", gender: "Male" });
  const notifOpts = [["Order Updates","Get notified when your order status changes",true],["Promotions & Deals","Exclusive discounts and flash sales",true],["New Arrivals","Be first to know about new products",false],["Review Reminders","Reminders to review your purchases",true],["Newsletter","Weekly picks and lifestyle content",false]];

  const navItems: { id: ProfileTab; icon: string; label: string }[] = [
    { id: "info",     icon: "👤", label: "Personal Info" },
    { id: "address",  icon: "📍", label: "Addresses" },
    { id: "security", icon: "🔒", label: "Security" },
    { id: "notif",    icon: "🔔", label: "Notifications" },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>
      {/* Banner */}
      <div style={{ background: "linear-gradient(135deg,#0d9488,#0f766e)", borderRadius: "1.5rem", height: 160, position: "relative", overflow: "hidden", marginBottom: "4rem" }}>
        <div style={{ position: "absolute", inset: 0, opacity: .1, backgroundImage: "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20'><circle cx='10' cy='10' r='1.5' fill='white'/></svg>\")" }} />
        <div style={{ position: "absolute", bottom: -36, left: 32 }}>
          <div style={{ border: "3px solid var(--teal)", padding: 3, borderRadius: "50%", display: "inline-block", background: "#fff" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#0d9488,#134e4a)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "1.4rem" }}>JD</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
        {/* Sidebar */}
        <aside style={{ width: 232, flexShrink: 0 }}>
          <div style={{ background: "#fff", borderRadius: "1.25rem", padding: "1rem", boxShadow: "0 2px 12px rgba(0,0,0,.05)" }}>
            <div style={{ textAlign: "center", paddingBottom: "1rem", borderBottom: "1px solid #f1f5f9", marginBottom: "0.75rem" }}>
              <p className="serif" style={{ fontWeight: 700, fontSize: "1.1rem" }}>John Doe</p>
              <p style={{ color: "#64748b", fontSize: ".8rem" }}>john.doe@email.com</p>
              <Badge style={{ marginTop: "0.5rem" }}>⭐ Gold Member</Badge>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {navItems.map(n => (
                <button key={n.id} onClick={() => setTab(n.id)}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: ".6rem 1rem", borderRadius: "0.75rem", border: "none", background: tab === n.id ? "var(--teal)" : "transparent", color: tab === n.id ? "#fff" : "#64748b", fontWeight: 500, fontSize: ".875rem", cursor: "pointer", width: "100%", textAlign: "left", transition: ".18s" }}>
                  <span>{n.icon}</span>{n.label}
                </button>
              ))}
              <hr style={{ border: "none", borderTop: "1px solid #f1f5f9", margin: "0.25rem 0" }} />
              <button onClick={() => goto("orders")} style={{ display: "flex", alignItems: "center", gap: 10, padding: ".6rem 1rem", borderRadius: "0.75rem", border: "none", background: "transparent", color: "#64748b", fontWeight: 500, fontSize: ".875rem", cursor: "pointer", width: "100%", textAlign: "left" }}>📦 Order History</button>
              <button onClick={() => goto("reviews")} style={{ display: "flex", alignItems: "center", gap: 10, padding: ".6rem 1rem", borderRadius: "0.75rem", border: "none", background: "transparent", color: "#64748b", fontWeight: 500, fontSize: ".875rem", cursor: "pointer", width: "100%", textAlign: "left" }}>⭐ My Reviews</button>
              <hr style={{ border: "none", borderTop: "1px solid #f1f5f9", margin: "0.25rem 0" }} />
              <button style={{ display: "flex", alignItems: "center", gap: 10, padding: ".6rem 1rem", borderRadius: "0.75rem", border: "none", background: "transparent", color: "#ef4444", fontWeight: 500, fontSize: ".875rem", cursor: "pointer", width: "100%", textAlign: "left" }}>🚪 Sign Out</button>
            </div>
          </div>
          {/* Stats */}
          <div style={{ background: "#fff", borderRadius: "1.25rem", padding: "1rem", boxShadow: "0 2px 12px rgba(0,0,0,.05)", marginTop: "1rem" }}>
            <p style={{ fontWeight: 600, fontSize: ".875rem", marginBottom: "0.75rem" }}>Account Stats</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {[["12","Orders"],["8","Reviews"],["3","Wishlist"],["$842","Spent"]].map(([v,l]) => (
                <div key={l} style={{ background: "var(--teal-xs)", borderRadius: "0.75rem", padding: "0.75rem", textAlign: "center" }}>
                  <p className="serif" style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--teal)" }}>{v}</p>
                  <p style={{ fontSize: ".75rem", color: "#64748b" }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {tab === "info" && (
            <div style={{ background: "#fff", borderRadius: "1.25rem", padding: "1.5rem", boxShadow: "0 2px 10px rgba(0,0,0,.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 className="serif" style={{ fontSize: "1.35rem", fontWeight: 700 }}>Personal Information</h2>
                {!editing ? <BtnOutline onClick={() => setEditing(true)}>✏️ Edit</BtnOutline> : <BtnOutline onClick={() => setEditing(false)}>✕ Cancel</BtnOutline>}
              </div>
              {!editing ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                  {[["First Name",form.firstName],["Last Name",form.lastName],["Email",form.email],["Phone",form.phone],["Date of Birth",form.dob],["Gender",form.gender]].map(([l,v]) => (
                    <div key={l}><p style={{ fontSize: ".75rem", color: "#94a3b8", marginBottom: 4 }}>{l}</p><p style={{ fontWeight: 500 }}>{v}</p></div>
                  ))}
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  {(["firstName","lastName","email","phone"] as const).map(k => (
                    <div key={k}><label style={{ fontSize: ".75rem", fontWeight: 600, color: "#4b5563", display: "block", marginBottom: 4 }}>{k === "firstName" ? "First Name" : k === "lastName" ? "Last Name" : k === "email" ? "Email" : "Phone"}</label>
                      <input value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} /></div>
                  ))}
                  <div><label style={{ fontSize: ".75rem", fontWeight: 600, color: "#4b5563", display: "block", marginBottom: 4 }}>Date of Birth</label><input type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} /></div>
                  <div><label style={{ fontSize: ".75rem", fontWeight: 600, color: "#4b5563", display: "block", marginBottom: 4 }}>Gender</label>
                    <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                      {["Male","Female","Other","Prefer not to say"].map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div style={{ gridColumn: "span 2", display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                    <BtnTeal onClick={() => setEditing(false)} style={{ padding: "0.6rem 1.5rem" }}>Save Changes</BtnTeal>
                    <BtnOutline onClick={() => setEditing(false)}>Cancel</BtnOutline>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "address" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2 className="serif" style={{ fontSize: "1.35rem", fontWeight: 700 }}>Saved Addresses</h2>
                <BtnTeal style={{ fontSize: ".875rem", padding: "0.5rem 1.2rem" }}>+ Add Address</BtnTeal>
              </div>
              {[{type:"🏠 Home",name:"John Doe",addr:"123 Nguyen Hue Street, District 1",city:"Ho Chi Minh City, 70000",def:true},{type:"🏢 Office",name:"John Doe",addr:"456 Le Loi Blvd, Floor 12",city:"District 3, Ho Chi Minh City, 70000",def:false}].map(a => (
                <div key={a.type} style={{ background: "#fff", borderRadius: "1.25rem", padding: "1.25rem", boxShadow: "0 2px 10px rgba(0,0,0,.05)", border: `2px solid ${a.def ? "var(--teal)" : "#e2e8f0"}`, marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                        <Badge>{a.type}</Badge>
                        {a.def && <Badge style={{ background: "#dcfce7", color: "#166534" }}>Default</Badge>}
                      </div>
                      <p style={{ fontWeight: 600, fontSize: ".9rem" }}>{a.name}</p>
                      <p style={{ color: "#64748b", fontSize: ".875rem" }}>{a.addr}</p>
                      <p style={{ color: "#64748b", fontSize: ".875rem" }}>{a.city}</p>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {!a.def && <span style={{ fontSize: ".8rem", color: "var(--teal)", cursor: "pointer" }}>Set Default</span>}
                      <span style={{ fontSize: ".8rem", color: "var(--teal)", cursor: "pointer" }}>Edit</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "security" && (
            <div>
              <h2 className="serif" style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "1.25rem" }}>Security Settings</h2>
              <div style={{ background: "#fff", borderRadius: "1.25rem", padding: "1.5rem", boxShadow: "0 2px 10px rgba(0,0,0,.05)", marginBottom: "1rem" }}>
                <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Change Password</h3>
                {["Current Password","New Password","Confirm New Password"].map(l => <div key={l} style={{ marginBottom: "0.75rem" }}><label style={{ fontSize: ".75rem", fontWeight: 600, display: "block", marginBottom: 4 }}>{l}</label><input type="password" placeholder="••••••••" style={{ maxWidth: 340 }} /></div>)}
                <BtnTeal style={{ marginTop: "0.5rem", padding: "0.6rem 1.5rem" }}>Update Password</BtnTeal>
              </div>
              <div style={{ background: "#fff", borderRadius: "1.25rem", padding: "1.5rem", boxShadow: "0 2px 10px rgba(0,0,0,.05)" }}>
                <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Two-Factor Authentication</h3>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div><p style={{ fontWeight: 500, fontSize: ".9rem" }}>Authenticator App</p><p style={{ color: "#64748b", fontSize: ".8rem" }}>Extra security layer</p></div>
                  <label style={{ position: "relative", display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
                    <input type="checkbox" style={{ display: "none" }} />
                    <div style={{ width: 44, height: 24, background: "#e2e8f0", borderRadius: 12, position: "relative" }}><div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: 2, boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} /></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {tab === "notif" && (
            <div>
              <h2 className="serif" style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "1.25rem" }}>Notification Preferences</h2>
              <div style={{ background: "#fff", borderRadius: "1.25rem", padding: "1.5rem", boxShadow: "0 2px 10px rgba(0,0,0,.05)" }}>
                {notifOpts.map(([title, desc, checked], i) => (
                  <div key={title as string} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 0", borderBottom: i < notifOpts.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                    <div><p style={{ fontWeight: 500, fontSize: ".9rem" }}>{title as string}</p><p style={{ color: "#64748b", fontSize: ".8rem", marginTop: 2 }}>{desc as string}</p></div>
                    <ToggleSwitch defaultOn={checked as boolean} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ToggleSwitch({ defaultOn }: { defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div onClick={() => setOn(v => !v)} style={{ width: 44, height: 24, borderRadius: 12, background: on ? "var(--teal)" : "#e2e8f0", cursor: "pointer", position: "relative", transition: ".2s", flexShrink: 0, marginLeft: 12 }}>
      <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: on ? 22 : 2, transition: ".2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
    </div>
  );
}

/* ── ORDER HISTORY ── */
function OrdersPage({ orders, goto }: { orders: Order[]; goto: (p: PageId) => void }) {
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  const statusCfg: Record<OrderStatus, { label: string; bg: string; color: string; icon: string }> = {
    delivered:  { label: "Delivered",  bg: "#dcfce7", color: "#166534", icon: "✅" },
    processing: { label: "Processing", bg: "#fef9c3", color: "#854d0e", icon: "⏳" },
    shipping:   { label: "Shipping",   bg: "#dbeafe", color: "#1e40af", icon: "🚚" },
    cancelled:  { label: "Cancelled",  bg: "#fee2e2", color: "#991b1b", icon: "❌" },
  };

  const filtered = orders.filter(o =>
    (filter === "all" || o.status === filter) &&
    (!search || o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.items.some(i => PRODUCTS.find(p => p.id === i.pid)?.name.toLowerCase().includes(search.toLowerCase())))
  );

  const progressPct = (s: OrderStatus) => s === "processing" ? 25 : s === "shipping" ? 62 : s === "delivered" ? 100 : 0;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem" }}>
      {detailOrder && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setDetailOrder(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "1.5rem", width: "90%", maxWidth: 520, overflow: "hidden", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>
            <div style={{ padding: "1.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "sticky", top: 0, background: "#fff", zIndex: 10 }}>
              <div><h3 className="serif" style={{ fontWeight: 700, fontSize: "1.15rem" }}>{detailOrder.id}</h3><p style={{ fontSize: ".8rem", color: "#64748b" }}>{detailOrder.date} · {detailOrder.payment}</p></div>
              <button onClick={() => setDetailOrder(null)} style={{ width: 32, height: 32, borderRadius: "50%", background: "#f1f5f9", border: "none", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "1.5rem" }}>
              <p style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: "1rem" }}>Order Progress</p>
              {[["Order Placed",true],["Payment Confirmed", detailOrder.status !== "cancelled"],["Packed & Ready", ["shipping","delivered"].includes(detailOrder.status)],["Out for Delivery", detailOrder.status === "delivered"],["Delivered", detailOrder.status === "delivered"]].map(([l,done]) => (
                <div key={l as string} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: done ? "var(--teal)" : "#f1f5f9", color: done ? "#fff" : "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".8rem", fontWeight: 700, flexShrink: 0 }}>{done ? "✓" : "○"}</div>
                  <span style={{ fontSize: ".9rem", fontWeight: done ? 500 : 400, color: done ? "#1e293b" : "#94a3b8" }}>{l as string}</span>
                </div>
              ))}
              <p style={{ fontWeight: 600, fontSize: ".9rem", margin: "1.25rem 0 .75rem" }}>Items Ordered</p>
              {detailOrder.items.map(item => { const p = PRODUCTS.find(x => x.id === item.pid)!; return (
                <div key={item.pid} style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "var(--teal-xs)", borderRadius: "0.75rem", padding: "0.75rem", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "1.5rem" }}>{p.emoji}</span>
                  <span style={{ flex: 1, fontSize: ".875rem", fontWeight: 500 }}>{p.name} ×{item.qty}</span>
                  <span style={{ fontWeight: 700, fontSize: ".875rem", color: "var(--teal)" }}>{fmt(p.price * item.qty)}</span>
                </div>
              ); })}
              {(() => { const sub = detailOrder.items.reduce((s,i) => s + PRODUCTS.find(p=>p.id===i.pid)!.price * i.qty, 0); return (
                <div style={{ background: "var(--teal-xs)", borderRadius: "0.75rem", padding: "1rem", margin: "1rem 0" }}>
                  {[["Subtotal",fmt(sub)],["Shipping","FREE"],["Tax (10%)",fmt(sub*.1)],["Total",fmt(sub*1.1)]].map(([l,v],i) => (
                    <div key={l} style={{ display: "flex", justifyContent: "space-between", fontWeight: i===3?700:400, fontSize: i===3?"1rem":".875rem", marginBottom: i<3?"0.3rem":0 }}>
                      <span style={{ color: i===3?"#1e293b":"#64748b" }}>{l}</span>
                      <span style={{ color: i===3?"var(--teal)":l==="Shipping"?"#16a34a":undefined }}>{v}</span>
                    </div>
                  ))}
                </div>
              ); })()}
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {detailOrder.status === "delivered" && <BtnTeal onClick={() => { setDetailOrder(null); goto("reviews"); }} style={{ flex: 1, padding: "0.6rem" }}>⭐ Write Review</BtnTeal>}
                {detailOrder.status === "shipping" && <BtnTeal style={{ flex: 1, padding: "0.6rem" }}>🗺 Track Shipment</BtnTeal>}
                <BtnOutline onClick={() => setDetailOrder(null)} className="" style={{ flex: 1, padding: "0.6rem" } as any}>Close</BtnOutline>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div><h1 className="serif" style={{ fontSize: "2rem", fontWeight: 700 }}>Order History</h1><p style={{ color: "#64748b", fontSize: ".875rem", marginTop: 4 }}>Track and manage all your past orders</p></div>
        <BtnOutline onClick={() => goto("products")}>+ New Order</BtnOutline>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", background: "#fff", borderRadius: "1rem", padding: "0.5rem", boxShadow: "0 2px 8px rgba(0,0,0,.04)", width: "fit-content", marginBottom: "1.25rem" }}>
        {(["all","processing","shipping","delivered","cancelled"] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: ".4rem 1rem", borderRadius: 9999, border: "none", background: filter === s ? "var(--teal)" : "transparent", color: filter === s ? "#fff" : "#64748b", fontWeight: 500, fontSize: ".85rem", cursor: "pointer", transition: ".2s" }}>
            {s === "all" ? "All Orders" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 480, marginBottom: "1.5rem" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by order ID or product…" />
      </div>

      {filtered.length === 0
        ? <div style={{ textAlign: "center", padding: "4rem" }}><span style={{ fontSize: "3rem" }}>📦</span><p className="serif" style={{ fontSize: "1.25rem", fontWeight: 700, marginTop: "1rem" }}>No orders found</p></div>
        : <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {filtered.map(o => {
            const sc = statusCfg[o.status];
            const total = o.items.reduce((s,i) => s + PRODUCTS.find(p=>p.id===i.pid)!.price*i.qty, 0) * 1.1;
            const fp = PRODUCTS.find(p => p.id === o.items[0].pid)!;
            const extra = o.items.length - 1;
            const pct = progressPct(o.status);
            return (
              <div key={o.id} style={{ background: "#fff", borderRadius: "1.25rem", boxShadow: "0 2px 10px rgba(0,0,0,.05)", overflow: "hidden", transition: ".2s" }}>
                <div style={{ padding: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span className="serif" style={{ fontWeight: 700, fontSize: "1rem" }}>{o.id}</span>
                        <span style={{ background: sc.bg, color: sc.color, borderRadius: 9999, padding: ".15rem .65rem", fontSize: ".75rem", fontWeight: 600 }}>{sc.icon} {sc.label}</span>
                      </div>
                      <p style={{ fontSize: ".75rem", color: "#94a3b8", marginTop: 2 }}>📅 {o.date} · 💳 {o.payment}</p>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--teal)" }}>{fmt(total)}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                    <div style={{ display: "flex" }}>
                      {o.items.slice(0,3).map(i => { const p = PRODUCTS.find(x=>x.id===i.pid)!; return <div key={i.pid} style={{ width: 40, height: 40, borderRadius: "0.6rem", background: "var(--teal-xs)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", border: "2px solid #fff", marginLeft: -4 }}>{p.emoji}</div>; })}
                    </div>
                    <div style={{ marginLeft: 4 }}>
                      <p style={{ fontSize: ".875rem", fontWeight: 500 }}>{fp.name}{extra > 0 && <span style={{ color: "#94a3b8", fontWeight: 400 }}> +{extra} more</span>}</p>
                      <p style={{ fontSize: ".75rem", color: "#94a3b8" }}>{o.items.reduce((s,i)=>s+i.qty,0)} item{o.items.reduce((s,i)=>s+i.qty,0)!==1?"s":""}</p>
                    </div>
                  </div>

                  {(o.status === "shipping" || o.status === "processing") && (
                    <div style={{ marginBottom: "1rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".7rem", color: "#94a3b8", marginBottom: 4 }}>
                        {["Ordered","Packed","In Transit","Delivered"].map(l => <span key={l}>{l}</span>)}
                      </div>
                      <div style={{ width: "100%", height: 6, background: "#f1f5f9", borderRadius: 3 }}>
                        <div style={{ height: 6, background: "var(--teal)", borderRadius: 3, width: `${pct}%`, transition: ".5s" }} />
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <BtnTeal onClick={() => setDetailOrder(o)} style={{ fontSize: ".8rem", padding: "0.45rem 1rem" }}>View Details</BtnTeal>
                    {o.status === "delivered" && <BtnOutline onClick={() => goto("reviews")} className="" style={{ fontSize: ".8rem", padding: "0.4rem .9rem" } as any}>⭐ Write Review</BtnOutline>}
                    {o.status === "shipping"   && <BtnOutline className="" style={{ fontSize: ".8rem", padding: "0.4rem .9rem" } as any}>🗺 Track Order</BtnOutline>}
                    {o.status === "processing" && <BtnOutline className="" style={{ fontSize: ".8rem", padding: "0.4rem .9rem" } as any}>Cancel</BtnOutline>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>}
    </div>
  );
}

/* ── REVIEWS ── */
function ReviewsPage({ orders }: { orders: Order[] }) {
  const [tab, setTab] = useState<ReviewTab>("write");
  const [picked, setPicked] = useState<Product | null>(null);
  const [star, setStar] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [myReviews, setMyReviews] = useState<Review[]>(MY_REVIEWS);

  const deliveredPids = [...new Set(orders.filter(o => o.status === "delivered").flatMap(o => o.items.map(i => i.pid)))];
  const displayStar = hoverStar || star;

  const submitReview = () => {
    if (!star || !title.trim() || !body.trim()) return;
    const r: Review = { pid: picked!.id, rating: star, title, body, pros, cons, date: "May 29, 2025", helpful: 0 };
    setMyReviews(v => [r, ...v]);
    setPicked(null); setStar(0); setTitle(""); setBody(""); setPros(""); setCons("");
    setTab("mine");
  };

  const tabBtns: { id: ReviewTab; label: string }[] = [
    { id: "write",   label: "✍️ Write a Review" },
    { id: "mine",    label: `📋 My Reviews (${myReviews.length})` },
    { id: "pending", label: `⏳ Pending (${PENDING_PIDS.length})` },
  ];

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "2rem 1.5rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 className="serif" style={{ fontSize: "2rem", fontWeight: 700 }}>Product Reviews</h1>
        <p style={{ color: "#64748b", fontSize: ".875rem", marginTop: 4 }}>Share your experience with the community</p>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", background: "#fff", borderRadius: "1rem", padding: "0.5rem", boxShadow: "0 2px 8px rgba(0,0,0,.04)", width: "fit-content", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {tabBtns.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: ".4rem 1rem", borderRadius: 9999, border: "none", background: tab === t.id ? "var(--teal)" : "transparent", color: tab === t.id ? "#fff" : "#64748b", fontWeight: 500, fontSize: ".85rem", cursor: "pointer", transition: ".2s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* WRITE TAB */}
      {tab === "write" && (
        <div>
          {!picked ? (
            <div style={{ background: "#fff", borderRadius: "1.25rem", padding: "1.5rem", boxShadow: "0 2px 10px rgba(0,0,0,.05)" }}>
              <h3 className="serif" style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "1.25rem" }}>Select a Product to Review</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: "0.75rem" }}>
                {deliveredPids.map(pid => { const p = PRODUCTS.find(x => x.id === pid)!; return (
                  <button key={pid} onClick={() => setPicked(p)}
                    style={{ padding: "0.75rem", borderRadius: "0.75rem", border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", textAlign: "center", transition: ".2s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--teal)"; (e.currentTarget as HTMLButtonElement).style.background = "var(--teal-xs)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLButtonElement).style.background = "#fff"; }}>
                    <span style={{ fontSize: "2rem", display: "block", marginBottom: 4 }}>{p.emoji}</span>
                    <p style={{ fontSize: ".78rem", fontWeight: 500, lineHeight: 1.3 }}>{p.name}</p>
                  </button>
                ); })}
              </div>
            </div>
          ) : (
            <div style={{ background: "#fff", borderRadius: "1.25rem", padding: "1.5rem", boxShadow: "0 2px 10px rgba(0,0,0,.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", borderRadius: "0.75rem", background: "var(--teal-xs)", marginBottom: "1.5rem" }}>
                <span style={{ fontSize: "2rem" }}>{picked.emoji}</span>
                <div style={{ flex: 1 }}><p style={{ fontWeight: 600, fontSize: ".9rem" }}>{picked.name}</p><p style={{ fontSize: ".75rem", color: "#64748b" }}>{picked.category}</p></div>
                <button onClick={() => { setPicked(null); setStar(0); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: "1.1rem" }}>✕</button>
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <p style={{ fontWeight: 600, fontSize: ".9rem", marginBottom: "0.5rem" }}>Your Rating <span style={{ color: "#ef4444" }}>*</span></p>
                <div style={{ display: "flex", gap: 4 }}>
                  {[1,2,3,4,5].map(n => (
                    <span key={n} onClick={() => setStar(n)} onMouseEnter={() => setHoverStar(n)} onMouseLeave={() => setHoverStar(0)}
                      style={{ fontSize: "2rem", cursor: "pointer", color: n <= displayStar ? "#f59e0b" : "#e2e8f0", transition: ".15s" }}>★</span>
                  ))}
                </div>
                <p style={{ fontSize: ".75rem", color: "#94a3b8", marginTop: 4 }}>{star ? `${STAR_LABELS[star]} — ${star}/5` : "Click to rate"}</p>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ fontSize: ".75rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Review Title <span style={{ color: "#ef4444" }}>*</span></label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Summarize your experience…" />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ fontSize: ".75rem", fontWeight: 600, display: "block", marginBottom: 4 }}>Detailed Review <span style={{ color: "#ef4444" }}>*</span></label>
                <textarea value={body} onChange={e => setBody(e.target.value)} rows={4} placeholder="What did you like or dislike? How was quality, value, and delivery?" />
                <p style={{ fontSize: ".75rem", color: "#94a3b8", textAlign: "right", marginTop: 2 }}>{body.length} / 500</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
                <div><label style={{ fontSize: ".75rem", fontWeight: 600, display: "block", marginBottom: 4 }}>👍 Pros</label><input value={pros} onChange={e => setPros(e.target.value)} placeholder="e.g. Great quality" /></div>
                <div><label style={{ fontSize: ".75rem", fontWeight: 600, display: "block", marginBottom: 4 }}>👎 Cons</label><input value={cons} onChange={e => setCons(e.target.value)} placeholder="e.g. Packaging" /></div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", borderRadius: "0.75rem", background: "#f8fafc", marginBottom: "1.25rem" }}>
                <ToggleSwitch defaultOn={true} />
                <span style={{ fontSize: ".9rem", fontWeight: 500 }}>I would recommend this product</span>
              </div>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <BtnTeal onClick={submitReview} style={{ flex: 1, padding: "0.75rem" }}>Submit Review ✓</BtnTeal>
                <BtnOutline onClick={() => setPicked(null)} className="" style={{ padding: "0.75rem 1.25rem" } as any}>Cancel</BtnOutline>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MY REVIEWS */}
      {tab === "mine" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {myReviews.map((r, idx) => {
            const p = PRODUCTS.find(x => x.id === r.pid)!;
            return (
              <div key={idx} style={{ background: "#fff", borderRadius: "1.25rem", padding: "1.25rem", boxShadow: "0 2px 10px rgba(0,0,0,.05)", transition: ".2s" }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 20px rgba(13,148,136,.12)"}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 10px rgba(0,0,0,.05)"}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: 44, height: 44, borderRadius: "0.75rem", background: "var(--teal-xs)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>{p.emoji}</div>
                    <div><p style={{ fontWeight: 600, fontSize: ".9rem" }}>{p.name}</p><p style={{ fontSize: ".75rem", color: "#94a3b8" }}>{r.date}</p></div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ fontSize: ".8rem", color: "var(--teal)", cursor: "pointer" }}>Edit</span>
                    <span style={{ fontSize: ".8rem", color: "#f87171", cursor: "pointer" }}>Delete</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.5rem" }}>
                  <StarRow rating={r.rating} size="text-base" />
                  <span style={{ fontWeight: 600, fontSize: ".9rem" }}>{r.title}</span>
                </div>
                <p style={{ color: "#4b5563", fontSize: ".875rem", lineHeight: 1.65, marginBottom: "0.75rem" }}>{r.body}</p>
                {(r.pros || r.cons) && (
                  <div style={{ display: "grid", gridTemplateColumns: r.pros && r.cons ? "1fr 1fr" : "1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                    {r.pros && <div style={{ background: "#f0fdf4", borderRadius: "0.6rem", padding: "0.6rem .75rem", fontSize: ".8rem" }}><span style={{ fontWeight: 700, color: "#166534", display: "block", marginBottom: 2 }}>👍 Pros</span><span style={{ color: "#15803d" }}>{r.pros}</span></div>}
                    {r.cons && <div style={{ background: "#fff7ed", borderRadius: "0.6rem", padding: "0.6rem .75rem", fontSize: ".8rem" }}><span style={{ fontWeight: 700, color: "#9a3412", display: "block", marginBottom: 2 }}>👎 Cons</span><span style={{ color: "#c2410c" }}>{r.cons}</span></div>}
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.75rem", borderTop: "1px solid #f1f5f9", alignItems: "center" }}>
                  <span style={{ fontSize: ".75rem", color: "#94a3b8" }}>👍 {r.helpful} found this helpful</span>
                  <span style={{ background: "#dcfce7", color: "#166534", borderRadius: 9999, padding: ".15rem .65rem", fontSize: ".75rem", fontWeight: 600 }}>✓ Verified Purchase</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PENDING */}
      {tab === "pending" && (
        <div>
          <p style={{ color: "#64748b", fontSize: ".875rem", marginBottom: "1rem" }}>These products are waiting for your review:</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {PENDING_PIDS.map(pid => { const p = PRODUCTS.find(x => x.id === pid)!; return (
              <div key={pid} style={{ background: "#fff", borderRadius: "1.25rem", padding: "1rem", boxShadow: "0 2px 10px rgba(0,0,0,.05)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: 56, height: 56, borderRadius: "0.75rem", background: "var(--teal-xs)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.75rem", flexShrink: 0 }}>{p.emoji}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: ".9rem" }}>{p.name}</p>
                  <p style={{ fontSize: ".75rem", color: "#94a3b8" }}>{p.category}</p>
                  <div style={{ display: "flex", gap: 2, marginTop: 4 }}>{Array.from({length:5},()=><span key={Math.random()} style={{color:"#e2e8f0",fontSize:".9rem"}}>★</span>)}</div>
                </div>
                <BtnTeal onClick={() => { setTab("write"); setPicked(p); }} style={{ fontSize: ".8rem", padding: "0.5rem 1rem" }}>Review</BtnTeal>
              </div>
            ); })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════════════════ */
function Navbar({ cartCount, goto, onSearch }: { cartCount: number; goto: (p: PageId) => void; onSearch: (q: string) => void }) {
  const [q, setQ] = useState("");
  return (
    <nav style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 50, padding: "0.75rem 1.5rem" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", gap: "1rem" }}>
        <button onClick={() => goto("home")} style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", marginRight: 8, flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: "0.7rem", background: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="#fff"/></svg>
          </div>
          <span className="serif" style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--teal)" }}>AquaMarket</span>
        </button>

        <div style={{ flex: 1, maxWidth: 480, position: "relative", display: "flex" }}>
          <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === "Enter" && onSearch(q)}
            placeholder="Search products, brands…" style={{ paddingLeft: "1rem", paddingRight: "2.5rem", borderRadius: 9999, fontSize: ".875rem" }} />
          <button onClick={() => onSearch(q)} style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", width: 32, height: 32, borderRadius: "50%", background: "var(--teal)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: 4 }}>
          {[["Shop","products"],["My Orders","orders"]].map(([l,p]) => (
            <button key={l} onClick={() => goto(p as PageId)}
              style={{ padding: ".4rem 0.75rem", borderRadius: 9999, fontSize: ".875rem", fontWeight: 500, background: "none", border: "none", cursor: "pointer", color: "var(--teal-dk)", whiteSpace: "nowrap" }}>
              {l}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
          <button onClick={() => goto("cart")} style={{ position: "relative", padding: "0.5rem", borderRadius: "50%", background: "none", border: "none", cursor: "pointer" }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="currentColor" strokeWidth="1.8"/><line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="1.8"/><path d="M16 10a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="1.8"/></svg>
            {cartCount > 0 && <span style={{ position: "absolute", top: -2, right: -2, width: 18, height: 18, borderRadius: "50%", background: "var(--teal)", color: "#fff", fontSize: ".7rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{cartCount}</span>}
          </button>
          <button onClick={() => goto("profile")} style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,var(--teal),var(--teal-dk))", color: "#fff", fontWeight: 700, fontSize: ".875rem", border: "none", cursor: "pointer" }}>JD</button>
        </div>
      </div>
    </nav>
  );
}

/* ─────────────────────────────────────────────────────────────
   CATEGORY BAR
───────────────────────────────────────────────────────────── */
function CategoryBar({ goto }: { goto: (p: PageId) => void }) {
  const cats = [["all","All Products"],["appliances","🏠 Appliances"],["food","🍱 Food & Drinks"],["beauty","💄 Beauty"]] as const;
  return (
    <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "0.5rem 1.5rem", overflowX: "auto" }}>
      <div style={{ display: "flex", gap: "0.5rem", maxWidth: 1280, margin: "0 auto" }}>
        {cats.map(([c, l]) => (
          <button key={c} onClick={() => goto("products")}
            style={{ padding: ".3rem .85rem", borderRadius: 9999, border: "1.5px solid #e2e8f0", fontSize: ".8rem", fontWeight: 500, background: "#fff", cursor: "pointer", whiteSpace: "nowrap", transition: ".2s" }}
            onMouseEnter={e => { const b = e.currentTarget; b.style.borderColor = "var(--teal)"; b.style.background = "var(--teal-xs)"; b.style.color = "var(--teal-dk)"; }}
            onMouseLeave={e => { const b = e.currentTarget; b.style.borderColor = "#e2e8f0"; b.style.background = "#fff"; b.style.color = ""; }}>
            {l}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ROOT APP
══════════════════════════════════════════════════════════ */
export default function App() {
  const [page, setPage] = useState<PageId>("home");
  const [detailId, setDetailId] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem("aq-cart") || "[]"); } catch { return []; }
  });
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [toast, setToast] = useState<string | null>(null);
  const [orderId, setOrderId] = useState("#AM00000");
  const [prevCart, setPrevCart] = useState<CartItem[]>([]);
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { localStorage.setItem("aq-cart", JSON.stringify(cart)); }, [cart]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 2400);
  }, []);

  const goto = useCallback((p: PageId, id?: number) => {
    if (p === "detail" && id) setDetailId(id);
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const addToCart = useCallback((id: number) => {
    setCart(c => {
      const existing = c.find(i => i.id === id);
      if (existing) return c.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { id, qty: 1 }];
    });
    showToast(`${PRODUCTS.find(p => p.id === id)?.name} added!`);
  }, [showToast]);

  const updateQty = useCallback((id: number, d: number) => {
    setCart(c => c.map(i => i.id === id ? { ...i, qty: i.qty + d } : i).filter(i => i.qty > 0));
  }, []);

  const removeItem = useCallback((id: number) => {
    setCart(c => c.filter(i => i.id !== id));
  }, []);

  const placeOrder = useCallback((method: PaymentMethod) => {
    const oid = "#AM" + Math.floor(10000 + Math.random() * 90000);
    const methodLabel = { card: "Credit Card", momo: "MoMo", bank: "Bank Transfer", cod: "COD" }[method];
    const newOrder: Order = {
      id: oid, date: new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),
      status: "processing", payment: methodLabel, items: cart.map(i => ({ pid: i.id, qty: i.qty })),
    };
    setOrders(o => [newOrder, ...o]);
    setPrevCart([...cart]);
    setOrderId(oid);
    setCart([]);
    setPage("success");
    window.scrollTo({ top: 0 });
  }, [cart]);

  const doSearch = useCallback((q: string) => {
    if (!q.trim()) return;
    setSearchTerm(q.trim());
    setPage("search");
    window.scrollTo({ top: 0 });
  }, []);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
        <Navbar cartCount={cartCount} goto={goto} onSearch={doSearch} />
        <CategoryBar goto={goto} />

        {page === "home"     && <HomePage goto={goto} onAdd={addToCart} />}
        {page === "products" && <ProductsPage goto={goto} onAdd={addToCart} initCategory="all" />}
        {page === "search"   && <SearchPage term={searchTerm} goto={goto} onAdd={addToCart} />}
        {page === "detail"   && <DetailPage productId={detailId} goto={goto} onAdd={addToCart} />}
        {page === "cart"     && <CartPage cart={cart} onUpdate={updateQty} onRemove={removeItem} goto={goto} />}
        {page === "checkout" && <CheckoutPage cart={cart} goto={goto} onPlaceOrder={placeOrder} />}
        {page === "success"  && <SuccessPage orderId={orderId} cart={prevCart} goto={goto} />}
        {page === "profile"  && <ProfilePage goto={goto} />}
        {page === "orders"   && <OrdersPage orders={orders} goto={goto} />}
        {page === "reviews"  && <ReviewsPage orders={orders} />}

        {toast && <Toast msg={toast} />}
      </div>
    </>
  );
}
