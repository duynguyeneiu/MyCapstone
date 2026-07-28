'use client';

import { useState, useEffect } from 'react';
import Icon from '../ui/Icon';
import { Modal, ModalHeader } from '../ui/AdminModal';
import Btn from '../ui/AdminBtn';
import { C } from '../../_lib/types';
import { fmt } from '../../_lib/utils';
import { PRODUCTS } from '../../../lib/data';
import ReceiptModal, { TransactionRecord } from './ReceiptModal';
import POSHistoryPage from './POSHistoryPage';

const posCSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Hanken+Grotesk:wght@600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');
* { box-sizing: border-box; }
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; user-select: none; }
.pos-layout { display: flex; flex: 1; overflow: hidden; }
.left-panel { flex: 1; display: flex; flex-direction: column; overflow: hidden; border-right: 1px solid #e0e3e5; background: #fff; }
.right-panel { width: 380px; flex-shrink: 0; display: flex; flex-direction: column; background: #fff; }
.topbar { height: 56px; background: #fff; border-bottom: 1px solid #e0e3e5; display: flex; align-items: center; padding: 0 16px; gap: 12px; flex-shrink: 0; }
.topbar-title { font-family: 'Hanken Grotesk', sans-serif; font-size: 18px; font-weight: 700; color: #00694c; }
.topbar-badge { font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 99px; background: #d1fae5; color: #064e3b; }
.search-bar-pos { padding: 12px 16px; border-bottom: 1px solid #e0e3e5; flex-shrink: 0; display: flex; gap: 8px; }
.search-input-wrap { flex: 1; position: relative; }
.search-input { width: 100%; border: 1.5px solid #e0e3e5; border-radius: 10px; padding: 9px 12px 9px 38px; font-size: 14px; background: #f7f9fb; outline: none; color: #191c1e; }
.search-input:focus { border-color: #00694c; background: #fff; }
.search-icon-pos { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #6d7a73; font-size: 20px; }
.cat-tabs { display: flex; gap: 6px; padding: 10px 16px; border-bottom: 1px solid #e0e3e5; overflow-x: auto; flex-shrink: 0; }
.cat-tabs::-webkit-scrollbar { display: none; }
.cat-tab { padding: 6px 14px; border-radius: 99px; font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap; border: 1.5px solid #e0e3e5; background: #fff; color: #3d4943; transition: all .15s; }
.cat-tab.active { background: #00694c; color: #fff; border-color: #00694c; }
.cat-tab:hover:not(.active) { border-color: #00694c; color: #00694c; }
.product-grid-pos { flex: 1; overflow-y: auto; padding: 12px 16px; display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; align-content: start; }
.product-grid-pos::-webkit-scrollbar { width: 4px; }
.product-grid-pos::-webkit-scrollbar-thumb { background: #bccac1; border-radius: 4px; }
.product-card-pos { border: 1.5px solid #e0e3e5; border-radius: 12px; padding: 12px 10px; cursor: pointer; transition: all .15s; background: #fff; }
.product-card-pos:hover:not(.out) { border-color: #00694c; box-shadow: 0 4px 12px rgba(0,105,76,0.12); transform: translateY(-1px); }
.product-card-pos.out { opacity: .45; cursor: not-allowed; }
.prod-icon-pos { width: 44px; height: 44px; border-radius: 10px; background: #00694c18; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; }
.prod-name-pos { font-size: 12px; font-weight: 600; color: #191c1e; line-height: 1.3; margin-bottom: 4px; }
.prod-price-pos { font-size: 13px; font-weight: 700; color: #00694c; }
.prod-stock-pos { font-size: 11px; color: #6d7a73; margin-top: 2px; }
.prod-stock-pos.low { color: #D97706; font-weight: 600; }
.prod-stock-pos.out { color: #dc2626; font-weight: 600; }
.invoice-header { padding: 14px 16px; border-bottom: 1px solid #e0e3e5; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
.invoice-title { font-size: 15px; font-weight: 700; color: #191c1e; }
.customer-bar { padding: 10px 16px; border-bottom: 1px solid #e0e3e5; flex-shrink: 0; }
.customer-select { width: 100%; border: 1.5px solid #e0e3e5; border-radius: 8px; padding: 8px 10px; font-size: 13px; background: #f7f9fb; color: #191c1e; outline: none; cursor: pointer; }
.customer-select:focus { border-color: #00694c; }
.cart-items-pos { flex: 1; overflow-y: auto; padding: 8px 0; }
.cart-items-pos::-webkit-scrollbar { width: 3px; }
.cart-items-pos::-webkit-scrollbar-thumb { background: #bccac1; border-radius: 3px; }
.cart-item-pos { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-bottom: 1px solid #f2f4f6; }
.cart-item-pos:last-child { border-bottom: none; }
.cart-item-name { flex: 1; font-size: 13px; font-weight: 500; color: #191c1e; line-height: 1.3; }
.cart-item-price { font-size: 12px; color: #6d7a73; margin-top: 2px; }
.qty-ctrl { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
.qty-btn { width: 24px; height: 24px; border-radius: 6px; border: 1.5px solid #e0e3e5; background: #f7f9fb; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 14px; font-weight: 700; color: #3d4943; transition: all .1s; }
.qty-btn:hover { border-color: #00694c; color: #00694c; background: #f0faf5; }
.qty-val { width: 28px; text-align: center; font-size: 14px; font-weight: 700; color: #191c1e; }
.item-subtotal { font-size: 13px; font-weight: 700; color: #191c1e; width: 72px; text-align: right; flex-shrink: 0; }
.remove-btn-pos { color: #bccac1; cursor: pointer; flex-shrink: 0; font-size: 18px; background: none; border: none; }
.remove-btn-pos:hover { color: #dc2626; }
.empty-cart { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #bccac1; gap: 8px; padding: 32px; }
.invoice-summary { padding: 12px 16px; border-top: 1px solid #e0e3e5; flex-shrink: 0; }
.summary-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; }
.summary-row .lbl { color: #6d7a73; }
.summary-row .val { color: #191c1e; font-weight: 500; }
.summary-total { display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; color: #191c1e; padding-top: 10px; border-top: 1.5px solid #e0e3e5; margin-top: 6px; }
.summary-total .val { color: #00694c; font-size: 18px; }
.payment-section { padding: 14px 16px 16px; border-top: 1px solid #e0e3e5; flex-shrink: 0; }
.payment-methods { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 12px; }
.pay-method { padding: 8px 6px; border: 1.5px solid #e0e3e5; border-radius: 8px; text-align: center; cursor: pointer; transition: all .15s; display: flex; flex-direction: column; align-items: center; gap: 2px; background: #fff; }
.pay-method .icon { font-size: 18px; color: #6d7a73; }
.pay-method .lbl { font-size: 10px; font-weight: 600; color: #6d7a73; margin-top: 2px; }
.pay-method.selected { border-color: #00694c; background: #f0faf5; }
.pay-method.selected .icon, .pay-method.selected .lbl { color: #00694c; }
.pay-method:hover:not(.selected) { border-color: #bccac1; }
.checkout-btn { width: 100%; padding: 14px; background: #00694c; color: #fff; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all .15s; display: flex; align-items: center; justify-content: center; gap: 8px; }
.checkout-btn:hover { background: #00513a; }
.checkout-btn:disabled { background: #bccac1; cursor: not-allowed; }
`;

const STOCK = (id: number) => (id * 17 + 3) % 120;
const POS_PRODUCTS = PRODUCTS.map(p => ({
  ...p,
  sku: `P${String(p.id).padStart(3, '0')}`,
  stock: STOCK(p.id),
}));
const POS_CATS = [
  { slug: 'all', label: 'All' },
  { slug: 'beverages', label: 'Beverages' },
  { slug: 'snacks', label: 'Snacks' },
  { slug: 'food', label: 'Food' },
  { slug: 'personal-care', label: 'Personal Care' },
  { slug: 'household', label: 'Household' },
];

const POS_PROMOS = [
  { code: 'SUMMER20',   desc: 'Summer sale 20% off',          type: 'Percentage', value: 20,     minOrder: 200000 },
  { code: 'WELCOME50K', desc: 'New customer 50,000₫ off',     type: 'Fixed',      value: 50000,  minOrder: 300000 },
  { code: 'FLASH15',    desc: 'Flash sale 15% this weekend',  type: 'Percentage', value: 15,     minOrder: 0      },
  { code: 'VIP100K',    desc: 'VIP customer 100,000₫ off',    type: 'Fixed',      value: 100000, minOrder: 500000 },
  { code: 'FREESHIP',   desc: 'Free shipping on all orders',  type: 'Fixed',      value: 30000,  minOrder: 150000 },
];

export default function POSPage() {
  interface CartItem { id: number; name: string; price: number; qty: number; }

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [invoiceNo, setInvoiceNo] = useState(1);
  const [clock, setClock] = useState("");

  // New: history & receipt states
  const [posHistory, setPosHistory] = useState<TransactionRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState<TransactionRecord | null>(null);

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }));
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t);
  }, []);

  const filtered = POS_PRODUCTS.filter((p) =>
    (activeCategory === "all" || p.category === activeCategory) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const addToCart = (product: typeof POS_PRODUCTS[0]) => {
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

  const applyPromo = (code: string) => {
    const promo = POS_PROMOS.find(p => p.code === code);
    if (!promo) { setDiscount(0); return; }
    if (subtotal < promo.minOrder) { setDiscount(0); return; }
    setDiscount(promo.type === 'Percentage'
      ? Math.round(subtotal * promo.value / 100)
      : Math.min(promo.value, subtotal));
  };

  const processPayment = () => {
    const now = new Date();
    const tx: TransactionRecord = {
      invoiceNo,
      date: now.toLocaleDateString("vi-VN"),
      time: now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      items: [...cart],
      subtotal,
      discount,
      vat,
      total,
      paymentMethod,
    };
    setPosHistory((h) => [...h, tx]);
    setCurrentReceipt(tx);
    setShowCheckout(false);
    setShowSuccess(true);
  };

  const handlePrintReceipt = () => {
    setShowSuccess(false);
    // currentReceipt stays set → ReceiptModal will open
  };

  const newInvoice = () => {
    setShowSuccess(false);
    setCurrentReceipt(null);
    setCart([]); setDiscount(0); setPromoCode("");
    setInvoiceNo((n) => n + 1);
  };

  const payMethods = [
    { id: "Cash", icon: "payments", label: "Cash" },
    { id: "QR", icon: "qr_code_2", label: "VNPay" },
  ];

  // ── Show history page ──────────────────────────────────────
  if (showHistory) {
    return (
      <>
        <POSHistoryPage
          history={posHistory}
          onBack={() => setShowHistory(false)}
          onViewReceipt={(tx) => setCurrentReceipt(tx)}
        />
        {currentReceipt && (
          <ReceiptModal
            tx={currentReceipt}
            onClose={() => setCurrentReceipt(null)}
          />
        )}
      </>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "#f2f4f6" }}>
      <style>{posCSS}</style>
      {/* Topbar */}
      <div className="topbar">
        <div style={{ width: 32, height: 32, background: C.primary, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="point_of_sale" size={18} style={{ color: "#fff" }} />
        </div>
        <span className="topbar-title" style={{ flex: 1 }}>RetailPro POS</span>
        <span className="topbar-badge">In-Store</span>

        {/* History button */}
        <button onClick={() => setShowHistory(true)}
          style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 8, border: `1.5px solid ${C.outline}`, background: "#fff", color: C.textMuted, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#f0faf5"; e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = C.outline; e.currentTarget.style.color = C.textMuted; }}
          title="View POS order history"
        >
          <Icon name="history" size={16} />
          History
          {posHistory.length > 0 && (
            <span style={{ background: C.primary, color: "#fff", borderRadius: 99, padding: "1px 6px", fontSize: 10, fontWeight: 700 }}>
              {posHistory.length}
            </span>
          )}
        </button>

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
            {POS_CATS.map((cat) => (
              <button key={cat.slug} onClick={() => setActiveCategory(cat.slug)}
                style={{ padding: "6px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                  border: `1.5px solid ${activeCategory === cat.slug ? C.primary : "#e0e3e5"}`,
                  background: activeCategory === cat.slug ? C.primary : "#fff",
                  color: activeCategory === cat.slug ? "#fff" : C.textMuted }}>
                {cat.label}
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
                <div style={{ width: 44, height: 44, borderRadius: 10, background: C.primaryBg, overflow: "hidden", marginBottom: 8 }}>
                  <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 4 }} />
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
        <div style={{ width: 340, display: "flex", flexDirection: "column", background: "#fff", flexShrink: 0, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid #e0e3e5`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>Invoice #{String(invoiceNo).padStart(4, "0")}</span>
            <button onClick={() => setCart([])} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: "#dc2626", fontSize: 12, fontWeight: 600 }}>
              <Icon name="delete" size={16} /> Clear
            </button>
          </div>

          <div style={{ flex: 1, overflow: "auto", minHeight: 0, padding: "8px 0" }}>
            {cart.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "#bccac1", gap: 8 }}>
                <Icon name="shopping_cart" size={48} style={{ color: "#bccac1" }} />
                <p style={{ fontSize: 14 }}>Cart is empty</p>
                <p style={{ fontSize: 12 }}>Click products to add</p>
              </div>
            ) : cart.map((item) => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderBottom: `1px solid #f2f4f6` }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
                  <p style={{ fontSize: 11, color: C.textFaint }}>{fmt(item.price)}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                  <button onClick={() => updateQty(item.id, -1)}
                    style={{ width: 22, height: 22, borderRadius: 6, border: `1.5px solid #e0e3e5`, background: "#f7f9fb", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>−</button>
                  <span style={{ width: 24, textAlign: "center", fontSize: 13, fontWeight: 700 }}>{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)}
                    style={{ width: 22, height: 22, borderRadius: 6, border: `1.5px solid #e0e3e5`, background: "#f7f9fb", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>+</button>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, width: 72, textAlign: "right", flexShrink: 0 }}>{fmt(item.price * item.qty)}</span>
                <button onClick={() => setCart((c) => c.filter((i) => i.id !== item.id))}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#bccac1" }}>
                  <Icon name="close" size={16} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ padding: "12px 16px", borderTop: `1px solid #e0e3e5`, flexShrink: 0 }}>
            <div style={{ marginBottom: 10 }}>
              <select
                value={promoCode}
                onChange={(e) => { setPromoCode(e.target.value); applyPromo(e.target.value); }}
                style={{ width: "100%", border: `1.5px solid #e0e3e5`, borderRadius: 8, padding: "7px 10px", fontSize: 13, background: "#f7f9fb", outline: "none", cursor: "pointer" }}
              >
                <option value="">— Select promotion —</option>
                {POS_PROMOS.map(p => (
                  <option key={p.code} value={p.code}>
                    {p.code} — {p.desc}
                  </option>
                ))}
              </select>
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

          <div style={{ padding: "12px 16px 20px", borderTop: `1px solid #e0e3e5`, flexShrink: 0 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, marginBottom: 12 }}>
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
                fontSize: 15, fontWeight: 700, cursor: cart.length === 0 ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
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
              <p style={{ fontSize: 12, color: C.textFaint, marginTop: 8 }}>Scan VNPay QR code to pay</p>
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
            <Btn variant="primary" onClick={handlePrintReceipt} style={{ flex: 1, justifyContent: "center" }}>
              <Icon name="receipt" size={16} style={{ color: "#fff" }} /> View Receipt
            </Btn>
          </div>
        </div>
      </Modal>

      {/* Receipt Modal (after payment or from history) */}
      {currentReceipt && !showSuccess && (
        <ReceiptModal
          tx={currentReceipt}
          onClose={() => setCurrentReceipt(null)}
          onNewInvoice={currentReceipt.invoiceNo === invoiceNo ? newInvoice : undefined}
        />
      )}
    </div>
  );
}
