import { useState, useEffect, useRef } from 'react';

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(Math.round(n)) + '₫';

const categories = ['All', 'Electronics', 'Food & Beverage', 'Household', 'Personal Care'];

const products = [
  { id: 1,  name: 'Wireless Earbuds Pro', cat: 'Electronics',     price: 490000, stock: 85, barcode: '8935217480010' },
  { id: 2,  name: 'Green Tea 500ml',      cat: 'Food & Beverage', price: 15000,  stock: 5,  barcode: '8935217480027' },
  { id: 3,  name: 'Dish Soap 750ml',      cat: 'Household',       price: 38000,  stock: 120,barcode: '8935217480034' },
  { id: 4,  name: 'Face Wash Foam',       cat: 'Personal Care',   price: 110000, stock: 0,  barcode: '8935217480041' },
  { id: 5,  name: 'USB-C Hub 7-in-1',    cat: 'Electronics',     price: 750000, stock: 32, barcode: '8935217480058' },
  { id: 6,  name: 'Instant Noodles',      cat: 'Food & Beverage', price: 7000,   stock: 3,  barcode: '8935217480065' },
  { id: 7,  name: 'Floor Cleaner 1L',    cat: 'Household',       price: 58000,  stock: 67, barcode: '8935217480072' },
  { id: 8,  name: 'Sunscreen SPF50+',    cat: 'Personal Care',   price: 195000, stock: 41, barcode: '8935217480089' },
  { id: 9,  name: 'AA Battery Pack',     cat: 'Electronics',     price: 35000,  stock: 8,  barcode: '8935217480096' },
  { id: 10, name: 'Coconut Milk',        cat: 'Food & Beverage', price: 18000,  stock: 0,  barcode: '8935217480102' },
  { id: 11, name: 'Shampoo 400ml',       cat: 'Personal Care',   price: 85000,  stock: 25, barcode: '8935217480119' },
  { id: 12, name: 'Detergent 1kg',       cat: 'Household',       price: 62000,  stock: 44, barcode: '8935217480126' },
];

const catColors: Record<string, string> = {
  'Electronics': '#4c1d95', 'Food & Beverage': '#1e3a8a', 'Household': '#064e3b', 'Personal Care': '#831843',
};
const catBg: Record<string, string> = {
  'Electronics': '#ede9fe', 'Food & Beverage': '#dbeafe', 'Household': '#d1fae5', 'Personal Care': '#fce7f3',
};
const catIcon: Record<string, string> = {
  'Electronics': 'devices', 'Food & Beverage': 'restaurant', 'Household': 'home', 'Personal Care': 'spa',
};

const promos = [
  { code: 'SUMMER20',   desc: 'Summer Sale 20% off',      type: 'pct',   val: 20,    minOrder: 200000 },
  { code: 'WELCOME50K', desc: 'New customer 50,000₫ off', type: 'fixed', val: 50000, minOrder: 300000 },
  { code: 'FLASH15',    desc: 'Flash Sale 15% off',       type: 'pct',   val: 15,    minOrder: 0      },
  { code: 'SAVE100K',   desc: 'VIP 100,000₫ off',         type: 'fixed', val: 100000,minOrder: 500000 },
  { code: 'FREESHIP',   desc: 'Free shipping 30,000₫ off',type: 'fixed', val: 30000, minOrder: 150000 },
];

interface CartItem { id: number; name: string; price: number; qty: number; }
interface Promo { code: string; desc: string; type: string; val: number; minOrder: number; }

export default function POS() {
  const [activeCat, setActiveCat] = useState('All');
  const [searchQ, setSearchQ] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPayment, setSelectedPayment] = useState('Cash');
  const [appliedPromo, setAppliedPromo] = useState<Promo | null>(null);
  const [selectedPromoCode, setSelectedPromoCode] = useState('');
  const [promoWarning, setPromoWarning] = useState('');
  const [invoiceCounter, setInvoiceCounter] = useState(1);
  const [clock, setClock] = useState('');
  const [invoiceTime, setInvoiceTime] = useState('');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function tick() {
      const now = new Date();
      setClock(now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setInvoiceTime(now.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }));
    }
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = appliedPromo
    ? appliedPromo.type === 'pct'
      ? subtotal * appliedPromo.val / 100
      : Math.min(appliedPromo.val, subtotal)
    : 0;
  const vat = (subtotal - discount) * 0.1;
  const total = Math.round(subtotal - discount + vat);

  function addToCart(id: number) {
    const p = products.find(x => x.id === id);
    if (!p || p.stock === 0) return;
    setCart(prev => {
      const ex = prev.find(x => x.id === id);
      if (ex) {
        if (ex.qty >= p.stock) return prev;
        return prev.map(x => x.id === id ? { ...x, qty: x.qty + 1 } : x);
      }
      return [...prev, { id, name: p.name, price: p.price, qty: 1 }];
    });
  }

  function changeQty(id: number, delta: number) {
    const p = products.find(x => x.id === id);
    if (!p) return;
    setCart(prev => prev.map(x => x.id === id
      ? { ...x, qty: Math.max(1, Math.min(x.qty + delta, p.stock)) }
      : x
    ));
  }

  function removeItem(id: number) {
    setCart(prev => prev.filter(x => x.id !== id));
  }

  function clearCart() {
    setCart([]);
    setAppliedPromo(null);
    setSelectedPromoCode('');
    setPromoWarning('');
  }

  function applyPromo(code: string) {
    setSelectedPromoCode(code);
    setPromoWarning('');
    if (!code) { setAppliedPromo(null); return; }
    const promo = promos.find(p => p.code === code);
    if (!promo) return;
    if (subtotal < promo.minOrder) {
      setPromoWarning(`Min order ${fmt(promo.minOrder)} required`);
      setAppliedPromo(null);
      return;
    }
    setAppliedPromo(promo);
  }

  function handleSearch(val: string) {
    setSearchQ(val);
    if (val.length >= 10) {
      const match = products.find(p => p.barcode === val);
      if (match && match.stock > 0) {
        addToCart(match.id);
        setSearchQ('');
        if (searchRef.current) searchRef.current.value = '';
      }
    }
  }

  const filteredProducts = products.filter(p =>
    (activeCat === 'All' || p.cat === activeCat) &&
    (!searchQ || p.name.toLowerCase().includes(searchQ.toLowerCase()) || p.barcode.includes(searchQ))
  );

  function processPayment() {
    setCheckoutOpen(false);
    setSuccessOpen(true);
  }

  function newInvoice() {
    setSuccessOpen(false);
    setInvoiceCounter(c => c + 1);
    clearCart();
  }

  function printReceipt() {
    const now = new Date().toLocaleString('vi-VN');
    const invNo = `INV-00${invoiceCounter}`;
    const receiptWin = window.open('', '_blank', 'width=320,height=600');
    if (!receiptWin) return;
    receiptWin.document.write(`<!DOCTYPE html><html><head>
<meta charset="utf-8"><title>Receipt ${invNo}</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Courier New',monospace;font-size:12px;width:300px;padding:16px;color:#000}.center{text-align:center}.bold{font-weight:bold}.large{font-size:15px}.divider{border-top:1px dashed #000;margin:8px 0}.row{display:flex;justify-content:space-between;margin-bottom:3px}.row .name{flex:1;padding-right:8px}.total-row{display:flex;justify-content:space-between;font-weight:bold;font-size:14px;margin-top:4px}.footer{text-align:center;margin-top:12px;font-size:11px}@media print{button{display:none!important}}</style>
</head><body>
<div class="center bold large">RETAILPRO STORE</div>
<div class="center">123 Nguyen Hue, Q1, TP.HCM</div>
<div class="center">Tel: 028 3825 1234</div>
<div class="divider"></div>
<div class="center bold">SALES RECEIPT</div>
<div class="center">${invNo}</div>
<div class="center">${now}</div>
<div class="center">Staff: Minh Tran</div>
<div class="divider"></div>
${cart.map(i => `<div class="row"><span class="name">${i.name}</span><span>${fmt(i.price * i.qty)}</span></div><div style="font-size:11px;color:#333;margin-bottom:4px;padding-left:4px">${i.qty} x ${fmt(i.price)}</div>`).join('')}
<div class="divider"></div>
<div class="row"><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
${discount > 0 && appliedPromo ? `<div class="row"><span>Discount (${appliedPromo.code})</span><span>-${fmt(discount)}</span></div>` : ''}
<div class="row"><span>VAT (10%)</span><span>${fmt(vat)}</span></div>
<div class="divider"></div>
<div class="total-row"><span>TOTAL</span><span>${fmt(total)}</span></div>
<div class="row" style="margin-top:4px"><span>Payment</span><span>${selectedPayment}</span></div>
<div class="divider"></div>
<div class="footer"><p>Thank you for shopping at RetailPro!</p><p>Please keep this receipt for warranty claims.</p><br><button onclick="window.print()" style="padding:8px 24px;background:#00694c;color:white;border:none;border-radius:6px;font-size:13px;cursor:pointer;font-family:sans-serif">🖨 Print</button></div>
</body></html>`);
    receiptWin.document.close();
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#f2f4f6', height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .cat-tab { padding:6px 14px; border-radius:99px; font-size:12px; font-weight:600; cursor:pointer; white-space:nowrap; border:1.5px solid #e0e3e5; background:#fff; color:#3d4943; transition:all .15s; }
        .cat-tab.active { background:#00694c; color:#fff; border-color:#00694c; }
        .cat-tab:hover:not(.active) { border-color:#00694c; color:#00694c; }
        .prod-card { border:1.5px solid #e0e3e5; border-radius:12px; padding:12px 10px; cursor:pointer; transition:all .15s; background:#fff; }
        .prod-card:hover:not(.out-stock) { border-color:#00694c; box-shadow:0 4px 12px rgba(0,105,76,0.12); transform:translateY(-1px); }
        .prod-card.out-stock { opacity:.45; cursor:not-allowed; }
        .qty-btn { width:24px; height:24px; border-radius:6px; border:1.5px solid #e0e3e5; background:#f7f9fb; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:14px; font-weight:700; color:#3d4943; transition:all .1s; }
        .qty-btn:hover { border-color:#00694c; color:#00694c; background:#f0faf5; }
        .remove-btn { color:#bccac1; cursor:pointer; font-size:18px; }
        .remove-btn:hover { color:#dc2626; }
        .pay-method { padding:8px 6px; border:1.5px solid #e0e3e5; border-radius:8px; text-align:center; cursor:pointer; transition:all .15s; }
        .pay-method.selected { border-color:#00694c; background:#f0faf5; }
        .pay-method.selected .pay-icon, .pay-method.selected .pay-label { color:#00694c; }
        .pay-icon { font-size:18px; color:#6d7a73; }
        .pay-label { font-size:10px; font-weight:600; color:#6d7a73; margin-top:2px; }
        @keyframes pop { 0%{transform:scale(0.8);opacity:0} 100%{transform:scale(1);opacity:1} }
        .pop-anim { animation:pop .25s ease; }
      `}</style>

      {/* Topbar */}
      <div style={{ height: 56, background: '#fff', borderBottom: '1px solid #e0e3e5', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <div style={{ width: 32, height: 32, background: '#00694c', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'white' }}>point_of_sale</span>
          </div>
          <span style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 18, fontWeight: 700, color: '#00694c' }}>RetailPro POS</span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 99, background: '#d1fae5', color: '#064e3b' }}>In-Store</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 13, color: '#3d4943', fontWeight: 500 }}>{clock}</div>
          <div style={{ width: 1, height: 20, background: '#e0e3e5' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#1d6fb8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white' }}>MT</div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#191c1e' }}>Minh Tran</span>
          </div>
          <button onClick={() => alert('Opening Sales History...')} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', border: '1.5px solid #e0e3e5', borderRadius: 8, background: '#fff', color: '#3d4943', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>receipt_long</span> History
          </button>
          <button onClick={() => { if (confirm('End shift and log out?')) alert('Logged out.'); }} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', border: '1.5px solid #fee2e2', borderRadius: 8, background: '#fff', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>logout</span> End Shift
          </button>
        </div>
      </div>

      {/* POS Layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* LEFT: Products */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: '1px solid #e0e3e5', background: '#fff' }}>
          {/* Search */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e0e3e5', flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#6d7a73', fontSize: 20 }}>search</span>
              <input ref={searchRef} style={{ width: '100%', border: '1.5px solid #e0e3e5', borderRadius: 10, padding: '9px 12px 9px 38px', fontSize: 14, background: '#f7f9fb', outline: 'none', color: '#191c1e', boxSizing: 'border-box' }}
                placeholder="Search product or scan barcode..." autoFocus
                onChange={e => handleSearch(e.target.value)} />
            </div>
          </div>

          {/* Category tabs */}
          <div style={{ display: 'flex', gap: 6, padding: '10px 16px', borderBottom: '1px solid #e0e3e5', overflowX: 'auto', flexShrink: 0 }}>
            {categories.map(c => (
              <div key={c} className={`cat-tab${activeCat === c ? ' active' : ''}`} onClick={() => setActiveCat(c)}>{c}</div>
            ))}
          </div>

          {/* Product grid */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 10, alignContent: 'start' }}>
            {filteredProducts.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#bccac1', padding: 32, fontSize: 14 }}>No products found</div>
            ) : filteredProducts.map(p => {
              const stockLabel = p.stock === 0 ? 'Out of stock' : p.stock <= 10 ? `Low: ${p.stock}` : `Stock: ${p.stock}`;
              const stockColor = p.stock === 0 ? '#dc2626' : p.stock <= 10 ? '#D97706' : '#6d7a73';
              return (
                <div key={p.id} className={`prod-card${p.stock === 0 ? ' out-stock' : ''}`} onClick={() => addToCart(p.id)}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: catBg[p.cat] || '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 22, color: catColors[p.cat] || '#374151' }}>{catIcon[p.cat] || 'inventory_2'}</span>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#191c1e', lineHeight: 1.3, marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#00694c' }}>{fmt(p.price)}</div>
                  <div style={{ fontSize: 11, color: stockColor, marginTop: 2, fontWeight: p.stock <= 10 ? 600 : 400 }}>{stockLabel}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Invoice */}
        <div style={{ width: 380, flexShrink: 0, display: 'flex', flexDirection: 'column', background: '#fff' }}>
          {/* Invoice header */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #e0e3e5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#191c1e' }}>Invoice <span style={{ color: '#00694c' }}>#INV-00{invoiceCounter}</span></div>
              <div style={{ fontSize: 11, color: '#6d7a73', marginTop: 2 }}>{invoiceTime}</div>
            </div>
            <button onClick={clearCart} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', border: '1.5px solid #e0e3e5', borderRadius: 8, background: '#fff', color: '#6d7a73', fontSize: 12, cursor: 'pointer' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete_sweep</span> Clear
            </button>
          </div>

          {/* Customer */}
          <div style={{ padding: '10px 16px', borderBottom: '1px solid #e0e3e5', flexShrink: 0 }}>
            <select style={{ width: '100%', border: '1.5px solid #e0e3e5', borderRadius: 8, padding: '8px 10px', fontSize: 13, background: '#f7f9fb', color: '#191c1e', outline: 'none', cursor: 'pointer' }}>
              <option value="">👤 Walk-in Customer</option>
              <option value="1">Minh Hoang — 0901234567 (1250 pts)</option>
              <option value="2">Phuong Linh — 0912345678 (890 pts)</option>
              <option value="3">Tran Anh — 0923456789 (2100 pts)</option>
              <option value="4">Lan Anh — 0945678901 (980 pts)</option>
              <option value="5">Bao Long — 0956789012 (320 pts)</option>
            </select>
          </div>

          {/* Cart */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
            {cart.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#bccac1', gap: 8, padding: '40px 0' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 48 }}>shopping_cart</span>
                <p style={{ fontSize: 14, fontWeight: 500 }}>Cart is empty</p>
                <p style={{ fontSize: 12 }}>Tap a product or scan barcode</p>
              </div>
            ) : cart.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderBottom: '1px solid #f2f4f6' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#191c1e', lineHeight: 1.3 }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: '#6d7a73', marginTop: 2 }}>{fmt(item.price)} each</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <div className="qty-btn" onClick={() => changeQty(item.id, -1)}>−</div>
                  <div style={{ width: 28, textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#191c1e' }}>{item.qty}</div>
                  <div className="qty-btn" onClick={() => changeQty(item.id, 1)}>+</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#191c1e', width: 72, textAlign: 'right', flexShrink: 0 }}>{fmt(item.price * item.qty)}</div>
                <span className="material-symbols-outlined remove-btn" onClick={() => removeItem(item.id)}>close</span>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid #e0e3e5', flexShrink: 0 }}>
            {/* Promo */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#3d4943', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.04em' }}>Promotion</label>
              <select value={selectedPromoCode} onChange={e => applyPromo(e.target.value)} style={{ width: '100%', border: '1.5px solid #e0e3e5', borderRadius: 8, padding: '8px 10px', fontSize: 13, background: '#f7f9fb', color: '#191c1e', outline: 'none', cursor: 'pointer' }}>
                <option value="">— No Promotion —</option>
                {promos.map(p => {
                  const discStr = p.type === 'pct' ? `${p.val}% off` : `${fmt(p.val)} off`;
                  const minStr = p.minOrder > 0 ? ` (min ${fmt(p.minOrder)})` : '';
                  return <option key={p.code} value={p.code}>{p.code} — {discStr}{minStr}</option>;
                })}
              </select>
              {(appliedPromo || promoWarning) && (
                <div style={{ marginTop: 6, padding: '8px 10px', background: appliedPromo ? '#f0faf5' : '#fef3c7', border: `1.5px solid ${appliedPromo ? '#86efac' : '#fde68a'}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#00694c' }}>local_offer</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#064e3b' }}>{promoWarning || appliedPromo?.desc}</span>
                  </div>
                  {appliedPromo && discount > 0 && (
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#dc2626' }}>-{fmt(discount)}</span>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: '#6d7a73' }}>Subtotal</span>
              <span style={{ color: '#191c1e', fontWeight: 500 }}>{fmt(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: '#6d7a73' }}>Promo: {appliedPromo?.code}</span>
                <span style={{ color: '#dc2626', fontWeight: 500 }}>-{fmt(discount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: '#6d7a73' }}>VAT (10%)</span>
              <span style={{ color: '#191c1e', fontWeight: 500 }}>{fmt(vat)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, color: '#191c1e', paddingTop: 10, borderTop: '1.5px solid #e0e3e5', marginTop: 6 }}>
              <span>Total</span>
              <span style={{ color: '#00694c', fontSize: 18 }}>{fmt(total)}</span>
            </div>
          </div>

          {/* Payment */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid #e0e3e5', flexShrink: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 10 }}>
              {[
                { id: 'Cash', icon: 'payments', label: 'Cash' },
                { id: 'QR', icon: 'qr_code', label: 'QR / Bank' },
                { id: 'Card', icon: 'credit_card', label: 'Card' },
              ].map(m => (
                <div key={m.id} className={`pay-method${selectedPayment === m.id ? ' selected' : ''}`} onClick={() => setSelectedPayment(m.id)}>
                  <div className={`material-symbols-outlined pay-icon`}>{m.icon}</div>
                  <div className="pay-label">{m.label}</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => cart.length > 0 && setCheckoutOpen(true)}
              disabled={cart.length === 0}
              style={{
                width: '100%', padding: 14, background: cart.length === 0 ? '#bccac1' : '#00694c',
                color: '#fff', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700,
                cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all .15s',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>point_of_sale</span>
              Checkout — {fmt(total)}
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {checkoutOpen && (
        <div onClick={e => e.target === e.currentTarget && setCheckoutOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 20, width: 420, maxWidth: '95vw', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e0e3e5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#191c1e' }}>Confirm Payment</p>
                <p style={{ fontSize: 12, color: '#6d7a73' }}>{selectedPayment}</p>
              </div>
              <button onClick={() => setCheckoutOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6d7a73' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              {selectedPayment === 'Cash' ? (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <p style={{ fontSize: 13, color: '#6d7a73', marginBottom: 6 }}>Amount to collect</p>
                  <p style={{ fontSize: 36, fontWeight: 700, color: '#00694c' }}>{fmt(total)}</p>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 160, height: 160, border: '2px solid #e0e3e5', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', background: '#f7f9fb' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 72, color: '#bccac1' }}>qr_code_2</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#6d7a73' }}>Scan QR code to pay</p>
                  <p style={{ fontSize: 20, fontWeight: 700, color: '#00694c', marginTop: 4 }}>{fmt(total)}</p>
                </div>
              )}
              <div style={{ marginTop: 16, padding: 14, background: '#f7f9fb', borderRadius: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: '#6d7a73' }}>Items</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#191c1e' }}>{cart.reduce((s, i) => s + i.qty, 0)} items</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#191c1e' }}>Total</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#00694c' }}>{fmt(total)}</span>
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e0e3e5' }}>
              <button onClick={processPayment} style={{ width: '100%', padding: 14, background: '#00694c', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successOpen && (
        <div onClick={e => e.target === e.currentTarget && setSuccessOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="pop-anim" style={{ background: '#fff', borderRadius: 20, padding: '36px 32px', textAlign: 'center', width: 420, maxWidth: '95vw', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 40, color: '#00694c' }}>check_circle</span>
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#191c1e', marginBottom: 8 }}>Payment Successful!</h2>
            <p style={{ fontSize: 14, color: '#6d7a73', marginBottom: 4 }}>Invoice #INV-00{invoiceCounter} • {cart.reduce((s, i) => s + i.qty, 0)} items</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: '#00694c', marginBottom: 4 }}>{fmt(total)}</p>
            <p style={{ fontSize: 13, color: '#6d7a73', marginBottom: 24 }}>Paid via {selectedPayment}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button onClick={printReceipt} style={{ padding: 12, border: '1.5px solid #e0e3e5', borderRadius: 10, background: '#fff', color: '#3d4943', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>print</span> Print
              </button>
              <button onClick={newInvoice} style={{ padding: 12, border: 'none', borderRadius: 10, background: '#00694c', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span> New Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
