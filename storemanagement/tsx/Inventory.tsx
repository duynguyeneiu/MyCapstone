import React, { useState } from 'react';
import Layout from '../components/Layout';

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + '₫';

const catColors: Record<string, { bg: string; color: string }> = {
  'Electronics':    { bg: '#e0f5ed', color: '#004d38' },
  'Food & Beverage':{ bg: '#fff3d6', color: '#7a5c00' },
  'Household':      { bg: '#e0f5ed', color: '#004d38' },
  'Personal Care':  { bg: '#fff3d6', color: '#7a5c00' },
};

interface Product { id: number; name: string; code: string; barcode: string; cat: string; stock: number; importPrice: number; }
interface ImportReceipt { id: string; date: string; staff: string; items: number; total: number; status: string; }
interface Transaction { date: string; product: string; type: string; qty: number; after: number; ref: string; }

const initialProducts: Product[] = [
  { id:1,  name:'Wireless Earbuds Pro',  code:'SP001', barcode:'8935217480010', cat:'Electronics',     stock:85, importPrice:320000 },
  { id:2,  name:'Green Tea 500ml',       code:'SP002', barcode:'8935217480027', cat:'Food & Beverage', stock:5,  importPrice:8000 },
  { id:3,  name:'Dish Soap 750ml',       code:'SP003', barcode:'8935217480034', cat:'Household',       stock:120,importPrice:22000 },
  { id:4,  name:'Face Wash Foam',        code:'SP004', barcode:'8935217480041', cat:'Personal Care',   stock:0,  importPrice:65000 },
  { id:5,  name:'USB-C Hub 7-in-1',     code:'SP005', barcode:'8935217480058', cat:'Electronics',     stock:32, importPrice:480000 },
  { id:6,  name:'Instant Noodles Pack', code:'SP006', barcode:'8935217480065', cat:'Food & Beverage', stock:3,  importPrice:4500 },
  { id:7,  name:'Floor Cleaner 1L',     code:'SP007', barcode:'8935217480072', cat:'Household',       stock:67, importPrice:35000 },
  { id:8,  name:'Sunscreen SPF50+',     code:'SP008', barcode:'8935217480089', cat:'Personal Care',   stock:41, importPrice:120000 },
  { id:9,  name:'AA Battery Pack',      code:'SP009', barcode:'8935217480096', cat:'Electronics',     stock:8,  importPrice:25000 },
  { id:10, name:'Coconut Milk Organic', code:'SP010', barcode:'8935217480102', cat:'Food & Beverage', stock:0,  importPrice:18000 },
];

const initialImports: ImportReceipt[] = [
  { id:'IMP-001', date:'24 May 2024', staff:'Alex Nguyen', items:5, total:2450000, status:'Completed' },
  { id:'IMP-002', date:'22 May 2024', staff:'Minh Tran',   items:3, total:890000,  status:'Completed' },
  { id:'IMP-003', date:'20 May 2024', staff:'Alex Nguyen', items:8, total:5200000, status:'Completed' },
  { id:'IMP-004', date:'18 May 2024', staff:'Lan Pham',    items:2, total:640000,  status:'Completed' },
];

const initialTransactions: Transaction[] = [
  { date:'24 May 09:32', product:'Wireless Earbuds Pro',  type:'Sale',   qty:-1,  after:85,  ref:'#ORD-2584' },
  { date:'24 May 08:00', product:'Green Tea 500ml',       type:'Import', qty:+20, after:5,   ref:'IMP-001' },
  { date:'23 May 17:20', product:'Dish Soap 750ml',       type:'Sale',   qty:-3,  after:120, ref:'#ORD-2581' },
  { date:'23 May 15:10', product:'Sunscreen SPF50+',      type:'Sale',   qty:-3,  after:41,  ref:'#ORD-2580' },
  { date:'23 May 12:30', product:'Instant Noodles Pack',  type:'Sale',   qty:-20, after:3,   ref:'#ORD-2579' },
  { date:'22 May 10:00', product:'Face Wash Foam',        type:'Adjust', qty:-5,  after:0,   ref:'Damaged' },
  { date:'22 May 09:00', product:'USB-C Hub 7-in-1',     type:'Import', qty:+10, after:32,  ref:'IMP-002' },
  { date:'20 May 14:00', product:'AA Battery Pack',       type:'Import', qty:+50, after:8,   ref:'IMP-003' },
];

const stockStatus = (stock: number) => {
  if (stock === 0) return { label: 'Out of Stock', bg: '#fee2e2', color: '#7f1d1d' };
  if (stock <= 10) return { label: 'Low Stock',    bg: '#fff3d6', color: '#7a5c00' };
  return                 { label: 'In Stock',     bg: '#e0f5ed', color: '#004d38' };
};

const txTypeConfig: Record<string, { bg: string; color: string }> = {
  'Sale':   { bg: '#fee2e2', color: '#7f1d1d' },
  'Import': { bg: '#e0f5ed', color: '#004d38' },
  'Adjust': { bg: '#fff3d6', color: '#7a5c00' },
};

const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [imports] = useState<ImportReceipt[]>(initialImports);
  const [transactions] = useState<Transaction[]>(initialTransactions);
  const [activeTab, setActiveTab] = useState<'stock' | 'import' | 'transactions'>('stock');
  const [search, setSearch] = useState('');
  const [catF, setCatF] = useState('');
  const [stockF, setStockF] = useState('');
  const [showAdjust, setShowAdjust] = useState(false);
  const [adjProduct, setAdjProduct] = useState('');
  const [adjType, setAdjType] = useState('add');
  const [adjQty, setAdjQty] = useState('');
  const [adjReason, setAdjReason] = useState('');

  const filteredProducts = products.filter(p => {
    const ss = stockStatus(p.stock).label;
    return (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search)) &&
      (!catF || p.cat === catF) &&
      (!stockF || ss === stockF);
  });

  const saveAdjust = () => {
    const pid = parseInt(adjProduct);
    const qty = parseInt(adjQty) || 0;
    if (!pid || !qty) return alert('Please select a product and enter quantity');
    setProducts(prev => prev.map(p => {
      if (p.id !== pid) return p;
      let newStock = p.stock;
      if (adjType === 'add') newStock += qty;
      else if (adjType === 'subtract') newStock = Math.max(0, p.stock - qty);
      else newStock = qty;
      return { ...p, stock: newStock };
    }));
    setShowAdjust(false); setAdjProduct(''); setAdjQty(''); setAdjReason('');
  };

  const selStyle: React.CSSProperties = { background: '#fff8e6', border: '1.5px solid #fcd97a', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#3d4943', outline: 'none' };
  const btnPrimary: React.CSSProperties = { background: 'linear-gradient(135deg,#00694c,#00a86b)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 };
  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: active ? 700 : 500,
    background: active ? '#00694c' : 'none', color: active ? '#fff' : '#3d4943', transition: 'all .15s',
  });

  const statCards = [
    { label:'Total SKUs', value:248, icon:'inventory_2', trend:'+8 this week', borderColor:'#b8e0cc', iconBg:'#e0f5ed', iconColor:'#00694c', trendColor:'#00694c', trendIcon:'trending_up', shadow:'0 0 0 1px #00694c1a,0 4px 20px #00694c14' },
    { label:'Total Stock Value', value:'18.4M₫', icon:'payments', trend:'+5% from last week', borderColor:'#fcd97a', iconBg:'#fff3d6', iconColor:'#b47b10', trendColor:'#b47b10', trendIcon:'trending_up', shadow:'0 0 0 1px #f59e0b1a,0 4px 20px #f59e0b14' },
    { label:'Low Stock Items', value:14, icon:'warning', trend:'Need restock', borderColor:'#fac057', iconBg:'#fff3d6', iconColor:'#854f0b', trendColor:'#854f0b', shadow:'0 0 0 1px #D9770622,0 4px 20px #D9770614', valueColor:'#854f0b' },
    { label:'Out of Stock', value:3, icon:'remove_shopping_cart', trend:'Urgent action', borderColor:'#fca5a5', iconBg:'#fee2e2', iconColor:'#dc2626', trendColor:'#dc2626', shadow:'0 0 0 1px #dc262622,0 4px 20px #dc262614', valueColor:'#dc2626' },
  ];

  return (
    <Layout activePage="inventory" title="Inventory" searchPlaceholder="Search product, barcode..." onSearch={setSearch}>
      <div style={{ padding: 32 }}>
        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:24, marginBottom:24 }}>
          {statCards.map((c, i) => (
            <div key={i} style={{ background:'#fff', border:`1px solid ${c.borderColor}`, borderRadius:12, padding:24, display:'flex', flexDirection:'column', justifyContent:'space-between', boxShadow:c.shadow, transition:'transform 0.18s' }}
              onMouseEnter={e => (e.currentTarget.style.transform='translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform='')}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <p style={{ fontSize:14, fontWeight:500, color:'#3d4943', marginBottom:4 }}>{c.label}</p>
                  <h3 style={{ fontSize:24, fontWeight:700, color:c.valueColor||'#191c1e' }}>{c.value}</h3>
                </div>
                <span className="material-symbols-outlined" style={{ padding:8, borderRadius:8, color:c.iconColor, background:c.iconBg }}>{c.icon}</span>
              </div>
              <div style={{ marginTop:16, display:'flex', alignItems:'center', gap:4 }}>
                {c.trendIcon && <span className="material-symbols-outlined" style={{ color:c.trendColor, fontSize:18 }}>{c.trendIcon}</span>}
                <span style={{ fontSize:10, fontWeight:600, color:c.trendColor }}>{c.trend}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs + Table */}
        <div style={{ background:'#fff', border:'1px solid #c8e4d8', borderRadius:12, overflow:'hidden' }}>
          {/* Tab bar */}
          <div style={{ padding:'16px 24px', borderBottom:'1px solid #c8e4d8', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
            <div style={{ display:'flex', gap:4 }}>
              {(['stock','import','transactions'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={tabBtn(activeTab === tab)}>
                  {tab === 'stock' ? '📦 Stock Levels' : tab === 'import' ? '📥 Import Receipts' : '📋 Transactions'}
                </button>
              ))}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => setShowAdjust(true)} style={{ ...btnPrimary, background:'linear-gradient(135deg,#f59e0b,#fbbf24)', color:'#431d00', boxShadow:'0 2px 8px #f59e0b44' }}>
                <span className="material-symbols-outlined" style={{ fontSize:18 }}>tune</span>Adjust Stock
              </button>
              <button style={btnPrimary}>
                <span className="material-symbols-outlined" style={{ fontSize:18 }}>add</span>New Import
              </button>
            </div>
          </div>

          {/* Stock Tab */}
          {activeTab === 'stock' && (
            <>
              <div style={{ padding:'12px 24px', borderBottom:'1px solid #c8e4d8', display:'flex', gap:12 }}>
                <select value={catF} onChange={e => setCatF(e.target.value)} style={selStyle}>
                  <option value="">All Categories</option>
                  {['Electronics','Food & Beverage','Household','Personal Care'].map(c => <option key={c}>{c}</option>)}
                </select>
                <select value={stockF} onChange={e => setStockF(e.target.value)} style={selStyle}>
                  <option value="">All Stock Status</option>
                  {['In Stock','Low Stock','Out of Stock'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', textAlign:'left' }}>
                  <thead style={{ background:'#f4fbf7' }}>
                    <tr>{['Product','Category','Barcode','Qty','Stock Status','Import Price','Stock Value','Actions'].map(h => (
                      <th key={h} style={{ padding:'12px 16px', fontSize:10, fontWeight:600, color:'#3d4943', textTransform:'uppercase', textAlign:h==='Qty'||h==='Actions'?'center':'left' }}>{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(p => {
                      const cc = catColors[p.cat] || { bg:'#e0f5ed', color:'#004d38' };
                      const ss = stockStatus(p.stock);
                      const pct = Math.min(100, Math.round(p.stock/150*100));
                      const barColor = p.stock === 0 ? '#dc2626' : p.stock <= 10 ? '#f59e0b' : '#00694c';
                      return (
                        <tr key={p.id} style={{ borderTop:'1px solid #c8e4d8' }}
                          onMouseEnter={e => (e.currentTarget.style.background='#f4fbf7')}
                          onMouseLeave={e => (e.currentTarget.style.background='')}>
                          <td style={{ padding:'12px 16px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                              <div style={{ width:36, height:36, borderRadius:8, background:'#e0f5ed', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                <span className="material-symbols-outlined" style={{ color:'#00694c', fontSize:18 }}>inventory_2</span>
                              </div>
                              <div><p style={{ fontWeight:700, fontSize:13 }}>{p.name}</p><p style={{ color:'#3d4943', fontSize:11 }}>{p.code}</p></div>
                            </div>
                          </td>
                          <td style={{ padding:'12px 16px' }}><span style={{ background:cc.bg, color:cc.color, padding:'2px 8px', borderRadius:999, fontSize:11, fontWeight:600 }}>{p.cat}</span></td>
                          <td style={{ padding:'12px 16px', color:'#3d4943', fontSize:12, fontFamily:'monospace' }}>{p.barcode}</td>
                          <td style={{ padding:'12px 16px', textAlign:'center', fontWeight:700, fontSize:13, color:p.stock===0?'#dc2626':p.stock<=10?'#854f0b':'#191c1e' }}>{p.stock}</td>
                          <td style={{ padding:'12px 16px', minWidth:140 }}>
                            <span style={{ background:ss.bg, color:ss.color, padding:'2px 8px', borderRadius:999, fontSize:11, fontWeight:700, display:'inline-block', marginBottom:4 }}>{ss.label}</span>
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                              <div style={{ flex:1, borderRadius:999, height:6, background:'#c8e4d8', minWidth:60 }}>
                                <div style={{ height:6, borderRadius:999, background:barColor, width:`${pct}%` }} />
                              </div>
                              <span style={{ fontSize:11, color:'#3d4943', minWidth:28 }}>{pct}%</span>
                            </div>
                          </td>
                          <td style={{ padding:'12px 16px', fontSize:13 }}>{fmt(p.importPrice)}</td>
                          <td style={{ padding:'12px 16px', fontWeight:700, fontSize:13 }}>{fmt(p.stock*p.importPrice)}</td>
                          <td style={{ padding:'12px 16px', textAlign:'center' }}>
                            <button onClick={() => { setAdjProduct(String(p.id)); setShowAdjust(true); }}
                              style={{ display:'flex', alignItems:'center', gap:4, padding:'4px 12px', borderRadius:8, border:'1px solid #c8e4d8', background:'none', fontSize:12, cursor:'pointer', margin:'0 auto' }}
                              onMouseEnter={e => { e.currentTarget.style.background='#e0f5ed'; e.currentTarget.style.borderColor='#00694c'; }}
                              onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.borderColor='#c8e4d8'; }}>
                              <span className="material-symbols-outlined" style={{ fontSize:14 }}>edit</span>Adjust
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ padding:'16px 24px', borderTop:'1px solid #c8e4d8' }}>
                <p style={{ color:'#3d4943', fontSize:13 }}>Showing {filteredProducts.length} of {products.length} products</p>
              </div>
            </>
          )}

          {/* Import Tab */}
          {activeTab === 'import' && (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', textAlign:'left' }}>
                <thead style={{ background:'#f4fbf7' }}>
                  <tr>{['Receipt ID','Date','Staff','Items','Total','Status','Actions'].map(h => (
                    <th key={h} style={{ padding:'12px 16px', fontSize:10, fontWeight:600, color:'#3d4943', textTransform:'uppercase', textAlign:h==='Actions'?'center':'left' }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {imports.map((r, i) => (
                    <tr key={i} style={{ borderTop:'1px solid #c8e4d8' }}
                      onMouseEnter={e => (e.currentTarget.style.background='#f4fbf7')}
                      onMouseLeave={e => (e.currentTarget.style.background='')}>
                      <td style={{ padding:'12px 16px', fontWeight:700, fontSize:13 }}>{r.id}</td>
                      <td style={{ padding:'12px 16px', color:'#3d4943', fontSize:13 }}>{r.date}</td>
                      <td style={{ padding:'12px 16px', fontSize:13 }}>{r.staff}</td>
                      <td style={{ padding:'12px 16px', fontSize:13 }}>{r.items} items</td>
                      <td style={{ padding:'12px 16px', fontWeight:700, fontSize:13 }}>{fmt(r.total)}</td>
                      <td style={{ padding:'12px 16px' }}><span style={{ background:'#e0f5ed', color:'#004d38', padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:700 }}>{r.status}</span></td>
                      <td style={{ padding:'12px 16px', textAlign:'center' }}>
                        <button style={{ width:32, height:32, borderRadius:8, border:'1px solid #c8e4d8', background:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', margin:'0 auto' }}>
                          <span className="material-symbols-outlined" style={{ fontSize:16, color:'#3d4943' }}>visibility</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', textAlign:'left' }}>
                <thead style={{ background:'#f4fbf7' }}>
                  <tr>{['Date','Product','Type','Qty Change','After','Reference'].map((h,i) => (
                    <th key={h} style={{ padding:'12px 16px', fontSize:10, fontWeight:600, color:'#3d4943', textTransform:'uppercase', textAlign:i===3||i===4?'center':'left' }}>{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {transactions.map((t, i) => {
                    const tc = txTypeConfig[t.type] || txTypeConfig['Adjust'];
                    const isIn = t.qty > 0;
                    return (
                      <tr key={i} style={{ borderTop:'1px solid #c8e4d8' }}
                        onMouseEnter={e => (e.currentTarget.style.background='#f4fbf7')}
                        onMouseLeave={e => (e.currentTarget.style.background='')}>
                        <td style={{ padding:'12px 16px', color:'#3d4943', fontSize:12 }}>{t.date}</td>
                        <td style={{ padding:'12px 16px', fontWeight:700, fontSize:13 }}>{t.product}</td>
                        <td style={{ padding:'12px 16px' }}><span style={{ background:tc.bg, color:tc.color, padding:'2px 8px', borderRadius:999, fontSize:11, fontWeight:600 }}>{t.type}</span></td>
                        <td style={{ padding:'12px 16px', textAlign:'center', fontWeight:700, fontSize:14, color:isIn?'#00694c':'#dc2626' }}>{isIn?'+':''}{t.qty}</td>
                        <td style={{ padding:'12px 16px', textAlign:'center', fontWeight:700, fontSize:13 }}>{t.after}</td>
                        <td style={{ padding:'12px 16px', color:'#3d4943', fontSize:12 }}>{t.ref}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Adjust Modal */}
      {showAdjust && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center' }}
          onClick={e => e.target === e.currentTarget && setShowAdjust(false)}>
          <div style={{ background:'#fff', borderRadius:12, border:'1px solid #c8e4d8', width:440, maxWidth:'95vw' }}>
            <div style={{ padding:24, borderBottom:'1px solid #c8e4d8', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h3 style={{ fontWeight:700, fontSize:18 }}>Adjust Stock</h3>
              <button onClick={() => setShowAdjust(false)} className="material-symbols-outlined" style={{ background:'none', border:'none', cursor:'pointer', color:'#3d4943' }}>close</button>
            </div>
            <div style={{ padding:24 }}>
              {[
                { label:'Product *', content: <select value={adjProduct} onChange={e => setAdjProduct(e.target.value)} style={{ width:'100%', border:'1.5px solid #c8e4d8', borderRadius:8, padding:'8px 12px', fontSize:14, background:'#f4fbf7', outline:'none' }}>
                  <option value="">Select product...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.stock} units)</option>)}
                </select> },
                { label:'Adjustment Type', content: <select value={adjType} onChange={e => setAdjType(e.target.value)} style={{ width:'100%', border:'1.5px solid #c8e4d8', borderRadius:8, padding:'8px 12px', fontSize:14, background:'#f4fbf7', outline:'none' }}>
                  <option value="add">Add Stock (+)</option>
                  <option value="subtract">Remove Stock (-)</option>
                  <option value="set">Set Exact Quantity</option>
                </select> },
                { label:'Quantity *', content: <input type="number" value={adjQty} onChange={e => setAdjQty(e.target.value)} min={0} placeholder="Enter quantity" style={{ width:'100%', border:'1.5px solid #c8e4d8', borderRadius:8, padding:'8px 12px', fontSize:14, background:'#f4fbf7', outline:'none', boxSizing:'border-box' as any }} /> },
                { label:'Reason', content: <input value={adjReason} onChange={e => setAdjReason(e.target.value)} placeholder="Reason for adjustment..." style={{ width:'100%', border:'1.5px solid #c8e4d8', borderRadius:8, padding:'8px 12px', fontSize:14, background:'#f4fbf7', outline:'none', boxSizing:'border-box' as any }} /> },
              ].map(f => (
                <div key={f.label} style={{ marginBottom:16 }}>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#3d4943', marginBottom:4 }}>{f.label}</label>
                  {f.content}
                </div>
              ))}
            </div>
            <div style={{ padding:'16px 24px', borderTop:'1px solid #c8e4d8', display:'flex', justifyContent:'flex-end', gap:12 }}>
              <button onClick={() => setShowAdjust(false)} style={{ padding:'8px 16px', borderRadius:8, border:'1px solid #c8e4d8', background:'none', color:'#3d4943', fontSize:14, cursor:'pointer' }}>Cancel</button>
              <button onClick={saveAdjust} style={btnPrimary}>Save Adjustment</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Inventory;
