import React, { useState } from 'react';
import Layout from '../components/Layout';

interface Product {
  id: number; name: string; code: string; barcode: string; cat: string;
  unit: string; importPrice: number; salePrice: number; stock: number; status: string;
}

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + '₫';

const catColors: Record<string, { bg: string; text: string }> = {
  'Electronics':    { bg: '#e0f5ed', text: '#004d38' },
  'Food & Beverage':{ bg: '#fff3d6', text: '#7a5c00' },
  'Household':      { bg: '#e0f5ed', text: '#004d38' },
  'Personal Care':  { bg: '#fff3d6', text: '#7a5c00' },
};

const statusMap: Record<string, { bg: string; text: string }> = {
  'Active':    { bg: '#e0f5ed', text: '#004d38' },
  'Inactive':  { bg: '#e5e7eb', text: '#374151' },
  'Low Stock': { bg: '#fff3d6', text: '#7a5c00' },
};

const initialProducts: Product[] = [
  { id:1, name:'Wireless Earbuds Pro', code:'SP001', barcode:'8935217480010', cat:'Electronics', unit:'pcs', importPrice:320000, salePrice:490000, stock:85, status:'Active' },
  { id:2, name:'Green Tea 500ml', code:'SP002', barcode:'8935217480027', cat:'Food & Beverage', unit:'bottle', importPrice:8000, salePrice:15000, stock:5, status:'Low Stock' },
  { id:3, name:'Dish Soap 750ml', code:'SP003', barcode:'8935217480034', cat:'Household', unit:'bottle', importPrice:22000, salePrice:38000, stock:120, status:'Active' },
  { id:4, name:'Face Wash Foam', code:'SP004', barcode:'8935217480041', cat:'Personal Care', unit:'tube', importPrice:65000, salePrice:110000, stock:0, status:'Inactive' },
  { id:5, name:'USB-C Hub 7-in-1', code:'SP005', barcode:'8935217480058', cat:'Electronics', unit:'pcs', importPrice:480000, salePrice:750000, stock:32, status:'Active' },
  { id:6, name:'Instant Noodles Pack', code:'SP006', barcode:'8935217480065', cat:'Food & Beverage', unit:'pack', importPrice:4500, salePrice:7000, stock:3, status:'Low Stock' },
  { id:7, name:'Floor Cleaner 1L', code:'SP007', barcode:'8935217480072', cat:'Household', unit:'bottle', importPrice:35000, salePrice:58000, stock:67, status:'Active' },
  { id:8, name:'Sunscreen SPF50+', code:'SP008', barcode:'8935217480089', cat:'Personal Care', unit:'tube', importPrice:120000, salePrice:195000, stock:41, status:'Active' },
];

const emptyForm = { name:'', code:'', barcode:'', cat:'', unit:'', stock:0, importPrice:0, salePrice:0, desc:'', status:'Active' };

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [catF, setCatF] = useState('');
  const [statusF, setStatusF] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = products.filter(p =>
    (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode.includes(search) || p.code.toLowerCase().includes(search.toLowerCase())) &&
    (!catF || p.cat === catF) &&
    (!statusF || p.status === statusF)
  );

  const selStyle: React.CSSProperties = { background: '#fff8e6', border: '1.5px solid #fcd97a', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#3d4943', outline: 'none' };
  const inputStyle: React.CSSProperties = { width: '100%', border: '1.5px solid #c8e4d8', borderRadius: 8, padding: '8px 12px', fontSize: 14, background: '#f4fbf7', outline: 'none', boxSizing: 'border-box' };
  const btnPrimary: React.CSSProperties = { background: 'linear-gradient(135deg, #00694c 0%, #00a86b 100%)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 2px 8px #00694c33', transition: 'all .15s' };

  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (p: Product) => {
    setEditId(p.id);
    setForm({ name:p.name, code:p.code, barcode:p.barcode, cat:p.cat, unit:p.unit, stock:p.stock, importPrice:p.importPrice, salePrice:p.salePrice, desc:'', status:p.status === 'Low Stock' ? 'Active' : p.status });
    setShowForm(true);
  };
  const save = () => {
    if (!form.name.trim()) return alert('Product name is required');
    if (editId !== null) {
      setProducts(prev => prev.map(p => p.id === editId ? { ...p, ...form } : p));
    } else {
      setProducts(prev => [...prev, { id: Date.now(), ...form, cat: form.cat || 'Electronics' }]);
    }
    setShowForm(false);
  };
  const confirmDel = () => { setProducts(prev => prev.filter(p => p.id !== deleteId)); setDeleteId(null); };

  const statCards = [
    { label:'Total Products', value:248, icon:'shopping_bag', trend:'+12 this month', borderColor:'#b8e0cc', iconBg:'#e0f5ed', iconColor:'#00694c', trendColor:'#00694c', trendIcon:'trending_up', shadow:'0 0 0 1px #00694c1a, 0 4px 20px #00694c14' },
    { label:'Active Products', value:231, icon:'check_circle', trend:'93% of total', borderColor:'#fcd97a', iconBg:'#fff3d6', iconColor:'#b47b10', trendColor:'#b47b10', shadow:'0 0 0 1px #f59e0b1a, 0 4px 20px #f59e0b14' },
    { label:'Low Stock', value:14, icon:'warning', trend:'Need restock', borderColor:'#fac057', iconBg:'#fff3d6', iconColor:'#854f0b', trendColor:'#854f0b', shadow:'0 0 0 1px #D9770622, 0 4px 20px #D9770614', valueColor:'#854f0b' },
    { label:'Categories', value:18, icon:'category', trend:'Active categories', borderColor:'#b8e0cc', iconBg:'#e0f5ed', iconColor:'#00694c', trendColor:'#00694c', shadow:'0 0 0 1px #00694c1a, 0 4px 20px #00694c14' },
  ];

  return (
    <Layout activePage="products" title="Products" searchPlaceholder="Search name, barcode, code..." onSearch={setSearch}>
      <div style={{ padding: 32 }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, marginBottom: 24 }}>
          {statCards.map((c, i) => (
            <div key={i} style={{ background:'#fff', border:`1px solid ${c.borderColor}`, borderRadius:12, padding:24, display:'flex', flexDirection:'column', justifyContent:'space-between', boxShadow:c.shadow, transition:'transform 0.18s' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = '')}>
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

        {/* Table */}
        <div style={{ background:'#fff', border:'1px solid #c8e4d8', borderRadius:12, overflow:'hidden' }}>
          <div style={{ padding:24, borderBottom:'1px solid #c8e4d8', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
            <div style={{ display:'flex', gap:12 }}>
              <select value={catF} onChange={e => setCatF(e.target.value)} style={selStyle}>
                <option value="">All Categories</option>
                {['Electronics','Food & Beverage','Household','Personal Care'].map(c => <option key={c}>{c}</option>)}
              </select>
              <select value={statusF} onChange={e => setStatusF(e.target.value)} style={selStyle}>
                <option value="">All Status</option>
                {['Active','Inactive','Low Stock'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <button onClick={openAdd} style={btnPrimary}>
              <span className="material-symbols-outlined" style={{ fontSize:18 }}>add</span>Add Product
            </button>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', textAlign:'left' }}>
              <thead style={{ background:'#f4fbf7' }}>
                <tr>
                  <th style={{ padding:'12px 16px', width:40 }}><input type="checkbox" /></th>
                  {['Product','Barcode','Category','Import Price','Sale Price','Stock','Status','Actions'].map(h => (
                    <th key={h} style={{ padding:'12px 16px', fontSize:10, fontWeight:600, color:'#3d4943', textTransform:'uppercase', textAlign:h==='Actions'?'center':'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const cc = catColors[p.cat] || { bg:'#e0f5ed', text:'#004d38' };
                  const sc = statusMap[p.status] || statusMap['Inactive'];
                  return (
                    <tr key={p.id} style={{ borderTop:'1px solid #c8e4d8' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f4fbf7')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}>
                      <td style={{ padding:'12px 16px' }}><input type="checkbox" /></td>
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                          <div style={{ width:36, height:36, borderRadius:8, background:'#e0f5ed', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            <span className="material-symbols-outlined" style={{ color:'#00694c', fontSize:18 }}>inventory_2</span>
                          </div>
                          <div>
                            <p style={{ fontWeight:700, fontSize:13 }}>{p.name}</p>
                            <p style={{ color:'#3d4943', fontSize:11 }}>{p.code}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:'12px 16px', color:'#3d4943', fontSize:12, fontFamily:'monospace' }}>{p.barcode}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <span style={{ background:cc.bg, color:cc.text, padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:600 }}>{p.cat}</span>
                      </td>
                      <td style={{ padding:'12px 16px', fontSize:13 }}>{fmt(p.importPrice)}</td>
                      <td style={{ padding:'12px 16px', fontWeight:700, fontSize:13 }}>{fmt(p.salePrice)}</td>
                      <td style={{ padding:'12px 16px', fontSize:13, fontWeight: p.stock <= 5 ? 700 : 400, color: p.stock <= 5 ? '#854f0b' : '#191c1e' }}>{p.stock}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <span style={{ background:sc.bg, color:sc.text, padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:700 }}>{p.status}</span>
                      </td>
                      <td style={{ padding:'12px 16px', textAlign:'center' }}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                          {[{ icon:'edit', hoverBg:'#e0f5ed', hoverBorder:'#00694c', action:() => openEdit(p) },
                            { icon:'delete', hoverBg:'#fee2e2', hoverBorder:'#dc2626', action:() => setDeleteId(p.id) }].map(btn => (
                            <button key={btn.icon} onClick={btn.action}
                              style={{ width:32, height:32, borderRadius:8, border:'1px solid #c8e4d8', background:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all 0.15s' }}
                              onMouseEnter={e => { e.currentTarget.style.background = btn.hoverBg; e.currentTarget.style.borderColor = btn.hoverBorder; }}
                              onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = '#c8e4d8'; }}>
                              <span className="material-symbols-outlined" style={{ fontSize:16, color:'#3d4943' }}>{btn.icon}</span>
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding:'16px 24px', borderTop:'1px solid #c8e4d8', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <p style={{ color:'#3d4943', fontSize:13 }}>Showing {filtered.length} of {products.length} products</p>
            <div style={{ display:'flex', gap:4 }}>
              {[{icon:'chevron_left'},{page:1,active:true},{page:2},{page:3},{icon:'chevron_right'}].map((btn,i) => (
                <button key={i} style={{ width:32, height:32, borderRadius:8, border:(btn as any).active?'none':'1px solid #c8e4d8', background:(btn as any).active?'linear-gradient(135deg,#00694c,#00a86b)':'none', color:(btn as any).active?'#fff':'#191c1e', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:13, fontWeight:(btn as any).active?700:400 }}>
                  {(btn as any).icon ? <span className="material-symbols-outlined" style={{ fontSize:16 }}>{(btn as any).icon}</span> : (btn as any).page}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center' }}
          onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={{ background:'#fff', borderRadius:12, border:'1px solid #c8e4d8', width:560, maxWidth:'95vw', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ padding:24, borderBottom:'1px solid #c8e4d8', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h3 style={{ fontWeight:700, fontSize:18 }}>{editId ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setShowForm(false)} className="material-symbols-outlined" style={{ background:'none', border:'none', cursor:'pointer', color:'#3d4943' }}>close</button>
            </div>
            <div style={{ padding:24 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#3d4943', marginBottom:4 }}>Product Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({...f, name:e.target.value}))} placeholder="Enter product name" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#3d4943', marginBottom:4 }}>Product Code *</label>
                  <input value={form.code} onChange={e => setForm(f => ({...f, code:e.target.value}))} placeholder="e.g. SP001" style={inputStyle} />
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#3d4943', marginBottom:4 }}>Barcode</label>
                  <input value={form.barcode} onChange={e => setForm(f => ({...f, barcode:e.target.value}))} placeholder="Scan or enter barcode" style={inputStyle} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#3d4943', marginBottom:4 }}>Category *</label>
                  <select value={form.cat} onChange={e => setForm(f => ({...f, cat:e.target.value}))} style={{...inputStyle}}>
                    <option value="">Select category</option>
                    {['Electronics','Food & Beverage','Household','Personal Care'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#3d4943', marginBottom:4 }}>Unit</label>
                  <input value={form.unit} onChange={e => setForm(f => ({...f, unit:e.target.value}))} placeholder="pcs, kg, box..." style={inputStyle} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#3d4943', marginBottom:4 }}>Initial Stock</label>
                  <input type="number" value={form.stock} onChange={e => setForm(f => ({...f, stock:+e.target.value}))} placeholder="0" min={0} style={inputStyle} />
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#3d4943', marginBottom:4 }}>Import Price (VND) *</label>
                  <input type="number" value={form.importPrice} onChange={e => setForm(f => ({...f, importPrice:+e.target.value}))} placeholder="0" min={0} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#3d4943', marginBottom:4 }}>Sale Price (VND) *</label>
                  <input type="number" value={form.salePrice} onChange={e => setForm(f => ({...f, salePrice:+e.target.value}))} placeholder="0" min={0} style={inputStyle} />
                </div>
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#3d4943', marginBottom:4 }}>Description</label>
                <textarea value={form.desc} onChange={e => setForm(f => ({...f, desc:e.target.value}))} rows={3} placeholder="Product description..." style={{...inputStyle, resize:'none'}} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#3d4943', marginBottom:4 }}>Status</label>
                <select value={form.status} onChange={e => setForm(f => ({...f, status:e.target.value}))} style={inputStyle}>
                  <option>Active</option><option>Inactive</option>
                </select>
              </div>
            </div>
            <div style={{ padding:'16px 24px', borderTop:'1px solid #c8e4d8', display:'flex', justifyContent:'flex-end', gap:12 }}>
              <button onClick={() => setShowForm(false)} style={{ padding:'8px 16px', borderRadius:8, border:'1px solid #c8e4d8', background:'none', color:'#3d4943', fontSize:14, cursor:'pointer' }}>Cancel</button>
              <button onClick={save} style={btnPrimary}>Save Product</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId !== null && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center' }}
          onClick={e => e.target === e.currentTarget && setDeleteId(null)}>
          <div style={{ background:'#fff', borderRadius:12, border:'1px solid #c8e4d8', width:360, padding:32, textAlign:'center' }}>
            <div style={{ width:56, height:56, borderRadius:'50%', background:'#fee2e2', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
              <span className="material-symbols-outlined" style={{ color:'#991b1b', fontSize:28 }}>delete</span>
            </div>
            <h3 style={{ fontWeight:700, fontSize:18, marginBottom:8 }}>Delete product?</h3>
            <p style={{ color:'#3d4943', fontSize:14, marginBottom:24 }}>"{products.find(p => p.id === deleteId)?.name}" will be permanently removed from the catalogue.</p>
            <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
              <button onClick={() => setDeleteId(null)} style={{ padding:'8px 20px', borderRadius:8, border:'1px solid #c8e4d8', background:'none', color:'#3d4943', fontSize:14, cursor:'pointer' }}>Cancel</button>
              <button onClick={confirmDel} style={{ padding:'8px 20px', borderRadius:8, background:'#dc2626', color:'#fff', fontWeight:700, fontSize:14, border:'none', cursor:'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Products;
