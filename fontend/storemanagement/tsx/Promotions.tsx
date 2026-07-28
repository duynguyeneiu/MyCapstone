import React, { useState } from 'react';
import Layout from '../components/Layout';

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + '₫';

interface Promo {
  id: number; code: string; desc: string; type: 'Percentage' | 'Fixed';
  value: number; minOrder: number; start: string; end: string; status: string;
}

const initialPromos: Promo[] = [
  { id:1, code:'SUMMER20',   desc:'Summer sale 20% off',         type:'Percentage', value:20,    minOrder:200000, start:'2024-05-01', end:'2024-05-31', status:'Active'   },
  { id:2, code:'WELCOME50K', desc:'New customer 50,000₫ off',    type:'Fixed',      value:50000, minOrder:300000, start:'2024-01-01', end:'2024-12-31', status:'Active'   },
  { id:3, code:'FLASH15',    desc:'Flash sale 15% this weekend', type:'Percentage', value:15,    minOrder:0,      start:'2024-05-24', end:'2024-05-26', status:'Active'   },
  { id:4, code:'VIP100K',    desc:'VIP customer 100,000₫ off',  type:'Fixed',      value:100000,minOrder:500000, start:'2024-05-01', end:'2024-05-28', status:'Active'   },
  { id:5, code:'FREESHIP',   desc:'Free shipping on all orders', type:'Fixed',      value:30000, minOrder:150000, start:'2024-05-20', end:'2024-05-27', status:'Active'   },
  { id:6, code:'TETHOLIDAY', desc:'Tet holiday special 25% off', type:'Percentage', value:25,    minOrder:400000, start:'2024-02-01', end:'2024-02-15', status:'Expired'  },
  { id:7, code:'BLACKFRI30', desc:'Black Friday 30% mega sale',  type:'Percentage', value:30,    minOrder:500000, start:'2023-11-24', end:'2023-11-24', status:'Expired'  },
  { id:8, code:'PAYDAY10',   desc:'Payday 10% off sitewide',     type:'Percentage', value:10,    minOrder:100000, start:'2024-06-01', end:'2024-06-30', status:'Inactive' },
];

const statusMap: Record<string, { bg: string; color: string }> = {
  'Active':   { bg:'#e0f5ed', color:'#004d38' },
  'Inactive': { bg:'#e5e7eb', color:'#374151' },
  'Expired':  { bg:'#fee2e2', color:'#7f1d1d' },
};

const daysLeft = (endDate: string) => {
  const end = new Date(endDate);
  const today = new Date();
  const diff = Math.ceil((end.getTime() - today.getTime()) / (1000*60*60*24));
  if (diff < 0) return <span style={{ fontSize:11, color:'#7f1d1d' }}>Expired</span>;
  if (diff === 0) return <span style={{ fontSize:11, color:'#dc2626', fontWeight:700 }}>Ends today!</span>;
  if (diff <= 7) return <span style={{ fontSize:11, color:'#854f0b', fontWeight:600 }}>{diff}d left</span>;
  return <span style={{ fontSize:11, color:'#3d4943' }}>{diff}d left</span>;
};

const emptyForm = { code:'', desc:'', type:'Percentage' as 'Percentage'|'Fixed', value:0, minOrder:0, start:'2024-05-24', end:'', status:'Active' };

const Promotions: React.FC = () => {
  const [promos, setPromos] = useState<Promo[]>(initialPromos);
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('');
  const [typeF, setTypeF] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = promos.filter(p =>
    (!search || p.code.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase())) &&
    (!statusF || p.status === statusF) &&
    (!typeF || p.type === typeF)
  );

  const openAdd = () => { setEditId(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (p: Promo) => { setEditId(p.id); setForm({ code:p.code, desc:p.desc, type:p.type, value:p.value, minOrder:p.minOrder, start:p.start, end:p.end, status:p.status }); setShowForm(true); };
  const save = () => {
    if (!form.code.trim()) return alert('Promo code is required');
    if (editId !== null) {
      setPromos(prev => prev.map(p => p.id === editId ? { ...p, ...form } : p));
    } else {
      setPromos(prev => [{ id: Date.now(), ...form, code: form.code.toUpperCase() }, ...prev]);
    }
    setShowForm(false);
  };

  const selStyle: React.CSSProperties = { background:'#fff8e6', border:'1.5px solid #fcd97a', borderRadius:8, padding:'8px 12px', fontSize:13, color:'#3d4943', outline:'none' };
  const inputStyle: React.CSSProperties = { width:'100%', border:'1.5px solid #c8e4d8', borderRadius:8, padding:'8px 12px', fontSize:14, background:'#f4fbf7', outline:'none', boxSizing:'border-box' };
  const btnPrimary: React.CSSProperties = { background:'linear-gradient(135deg,#00694c,#00a86b)', color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontSize:14, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:8 };

  const statCards = [
    { label:'Active Promotions', value:5, icon:'local_offer', trend:'Running now', borderColor:'#b8e0cc', iconBg:'#e0f5ed', iconColor:'#00694c', trendColor:'#00694c', shadow:'0 0 0 1px #00694c1a,0 4px 20px #00694c14' },
    { label:'Total Discount Given', value:'2.4M₫', icon:'discount', trend:'+15% this month', borderColor:'#fcd97a', iconBg:'#fff3d6', iconColor:'#b47b10', trendColor:'#b47b10', trendIcon:'trending_up', shadow:'0 0 0 1px #f59e0b1a,0 4px 20px #f59e0b14' },
    { label:'Redemptions', value:142, icon:'receipt', trend:'+8% this week', borderColor:'#b8e0cc', iconBg:'#e0f5ed', iconColor:'#00694c', trendColor:'#00694c', trendIcon:'trending_up', shadow:'0 0 0 1px #00694c1a,0 4px 20px #00694c14' },
    { label:'Expired', value:2, icon:'event_busy', trend:'Need cleanup', borderColor:'#fca5a5', iconBg:'#fee2e2', iconColor:'#dc2626', trendColor:'#dc2626', shadow:'0 0 0 1px #dc262622,0 4px 20px #dc262614', valueColor:'#dc2626' },
  ];

  return (
    <Layout activePage="promotions" title="Promotions" searchPlaceholder="Search promo code..." onSearch={setSearch}>
      <div style={{ padding:32 }}>
        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:24, marginBottom:24 }}>
          {statCards.map((c, i) => (
            <div key={i} style={{ background:'#fff', border:`1px solid ${c.borderColor}`, borderRadius:12, padding:24, display:'flex', flexDirection:'column', justifyContent:'space-between', boxShadow:c.shadow, transition:'transform 0.18s' }}
              onMouseEnter={e => (e.currentTarget.style.transform='translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform='')}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <p style={{ fontSize:14, fontWeight:500, color:'#3d4943', marginBottom:4 }}>{c.label}</p>
                  <h3 style={{ fontSize:24, fontWeight:700, color:(c as any).valueColor||'#191c1e' }}>{c.value}</h3>
                </div>
                <span className="material-symbols-outlined" style={{ padding:8, borderRadius:8, color:c.iconColor, background:c.iconBg }}>{c.icon}</span>
              </div>
              <div style={{ marginTop:16, display:'flex', alignItems:'center', gap:4 }}>
                {(c as any).trendIcon && <span className="material-symbols-outlined" style={{ color:c.trendColor, fontSize:18 }}>{(c as any).trendIcon}</span>}
                <span style={{ fontSize:10, fontWeight:600, color:c.trendColor }}>{c.trend}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background:'#fff', border:'1px solid #c8e4d8', borderRadius:12, overflow:'hidden' }}>
          <div style={{ padding:24, borderBottom:'1px solid #c8e4d8', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
            <div style={{ display:'flex', gap:12 }}>
              <select value={statusF} onChange={e => setStatusF(e.target.value)} style={selStyle}>
                <option value="">All Status</option>{['Active','Inactive','Expired'].map(s => <option key={s}>{s}</option>)}
              </select>
              <select value={typeF} onChange={e => setTypeF(e.target.value)} style={selStyle}>
                <option value="">All Types</option><option>Percentage</option><option>Fixed</option>
              </select>
            </div>
            <button onClick={openAdd} style={btnPrimary}>
              <span className="material-symbols-outlined" style={{ fontSize:18 }}>add</span>Add Promotion
            </button>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', textAlign:'left' }}>
              <thead style={{ background:'#f4fbf7' }}>
                <tr>
                  <th style={{ padding:'12px 16px', width:40 }}><input type="checkbox" /></th>
                  {['Code','Description','Type','Discount','Min Order','Validity','Status','Actions'].map(h => (
                    <th key={h} style={{ padding:'12px 16px', fontSize:10, fontWeight:600, color:'#3d4943', textTransform:'uppercase', textAlign:h==='Actions'?'center':'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const sc = statusMap[p.status] || statusMap['Inactive'];
                  return (
                    <tr key={p.id} style={{ borderTop:'1px solid #c8e4d8' }}
                      onMouseEnter={e => (e.currentTarget.style.background='#f4fbf7')}
                      onMouseLeave={e => (e.currentTarget.style.background='')}>
                      <td style={{ padding:'12px 16px' }}><input type="checkbox" /></td>
                      <td style={{ padding:'12px 16px' }}>
                        <div style={{ padding:'4px 12px', borderRadius:8, border:'2px dashed #00694c', background:'#e0f5ed', display:'inline-block' }}>
                          <span style={{ fontWeight:700, fontSize:12, color:'#00694c', letterSpacing:'0.05em' }}>{p.code}</span>
                        </div>
                      </td>
                      <td style={{ padding:'12px 16px', color:'#3d4943', fontSize:13, maxWidth:200 }}>{p.desc}</td>
                      <td style={{ padding:'12px 16px' }}>
                        {p.type === 'Percentage'
                          ? <span style={{ background:'#e0f5ed', color:'#004d38', padding:'2px 8px', borderRadius:999, fontSize:11, fontWeight:600 }}>% Percent</span>
                          : <span style={{ background:'#fff3d6', color:'#7a5c00', padding:'2px 8px', borderRadius:999, fontSize:11, fontWeight:600 }}>₫ Fixed</span>}
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        {p.type === 'Percentage'
                          ? <span style={{ fontWeight:700, fontSize:15, color:'#00694c' }}>{p.value}%</span>
                          : <span style={{ fontWeight:700, fontSize:14, color:'#b47b10' }}>{fmt(p.value)}</span>}
                      </td>
                      <td style={{ padding:'12px 16px', color:'#3d4943', fontSize:13 }}>{p.minOrder ? fmt(p.minOrder) : '—'}</td>
                      <td style={{ padding:'12px 16px' }}>
                        <p style={{ fontSize:12, color:'#3d4943' }}>{p.start} → {p.end}</p>
                        <div style={{ marginTop:4 }}>{daysLeft(p.end)}</div>
                      </td>
                      <td style={{ padding:'12px 16px' }}>
                        <span style={{ background:sc.bg, color:sc.color, padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:700 }}>{p.status}</span>
                      </td>
                      <td style={{ padding:'12px 16px', textAlign:'center' }}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                          {[{icon:'edit',hoverBg:'#e0f5ed',hoverBorder:'#00694c',action:() => openEdit(p)},
                            {icon:'delete',hoverBg:'#fee2e2',hoverBorder:'#dc2626',action:() => setDeleteId(p.id)}].map(btn => (
                            <button key={btn.icon} onClick={btn.action}
                              style={{ width:32, height:32, borderRadius:8, border:'1px solid #c8e4d8', background:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}
                              onMouseEnter={e => { e.currentTarget.style.background=btn.hoverBg; e.currentTarget.style.borderColor=btn.hoverBorder; }}
                              onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.borderColor='#c8e4d8'; }}>
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
            <p style={{ color:'#3d4943', fontSize:13 }}>Showing {filtered.length} of {promos.length} promotions</p>
            <div style={{ display:'flex', gap:4 }}>
              {[{icon:'chevron_left'},{page:1,active:true},{page:2},{icon:'chevron_right'}].map((btn,i) => (
                <button key={i} style={{ width:32, height:32, borderRadius:8, border:(btn as any).active?'none':'1px solid #c8e4d8', background:(btn as any).active?'linear-gradient(135deg,#00694c,#00a86b)':'none', color:(btn as any).active?'#fff':'#191c1e', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:13 }}>
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
          <div style={{ background:'#fff', borderRadius:12, border:'1px solid #c8e4d8', width:480, maxWidth:'95vw', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ padding:24, borderBottom:'1px solid #c8e4d8', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h3 style={{ fontWeight:700, fontSize:18 }}>{editId ? 'Edit Promotion' : 'Add Promotion'}</h3>
              <button onClick={() => setShowForm(false)} className="material-symbols-outlined" style={{ background:'none', border:'none', cursor:'pointer', color:'#3d4943' }}>close</button>
            </div>
            {/* Preview card */}
            <div style={{ margin:24, padding:16, background:'linear-gradient(135deg,#e0f5ed,#fff3d6)', borderRadius:12, textAlign:'center', border:'2px dashed #00694c' }}>
              <p style={{ fontSize:10, color:'#3d4943', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>Preview</p>
              <p style={{ fontWeight:700, fontSize:22, color:'#00694c', letterSpacing:'0.1em' }}>{form.code || 'CODE'}</p>
              <p style={{ fontWeight:700, fontSize:16, color:'#191c1e', marginTop:4 }}>{form.type === 'Percentage' ? `${form.value}% off` : `${fmt(form.value)} off`}</p>
              <p style={{ fontSize:12, color:'#3d4943', marginTop:4 }}>{form.minOrder > 0 ? `Min order: ${fmt(form.minOrder)}` : 'No minimum order'}</p>
            </div>
            <div style={{ padding:'0 24px 24px' }}>
              {[
                { label:'Promo Code *', el: <input value={form.code} onChange={e => setForm(f => ({...f, code:e.target.value.toUpperCase()}))} placeholder="e.g. SUMMER20" style={inputStyle} /> },
                { label:'Description', el: <input value={form.desc} onChange={e => setForm(f => ({...f, desc:e.target.value}))} placeholder="Short description..." style={inputStyle} /> },
                { label:'Discount Type', el: <select value={form.type} onChange={e => setForm(f => ({...f, type:e.target.value as any}))} style={inputStyle}><option>Percentage</option><option>Fixed</option></select> },
                { label:'Discount Value *', el: <input type="number" value={form.value} onChange={e => setForm(f => ({...f, value:+e.target.value}))} placeholder="0" min={0} style={inputStyle} /> },
                { label:'Min Order (VND)', el: <input type="number" value={form.minOrder} onChange={e => setForm(f => ({...f, minOrder:+e.target.value}))} placeholder="0 = no minimum" min={0} style={inputStyle} /> },
              ].map(f => (
                <div key={f.label} style={{ marginBottom:16 }}>
                  <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#3d4943', marginBottom:4 }}>{f.label}</label>
                  {f.el}
                </div>
              ))}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
                {[{label:'Start Date',key:'start'},{label:'End Date',key:'end'}].map(f => (
                  <div key={f.key}>
                    <label style={{ display:'block', fontSize:12, fontWeight:600, color:'#3d4943', marginBottom:4 }}>{f.label}</label>
                    <input type="date" value={(form as any)[f.key]} onChange={e => setForm(prev => ({...prev, [f.key]:e.target.value}))} style={inputStyle} />
                  </div>
                ))}
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
              <button onClick={save} style={btnPrimary}>Save Promotion</button>
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
            <h3 style={{ fontWeight:700, fontSize:18, marginBottom:8 }}>Delete Promotion?</h3>
            <p style={{ color:'#3d4943', fontSize:14, marginBottom:24 }}>Promotion "{promos.find(p => p.id === deleteId)?.code}" will be permanently removed.</p>
            <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
              <button onClick={() => setDeleteId(null)} style={{ padding:'8px 20px', borderRadius:8, border:'1px solid #c8e4d8', background:'none', color:'#3d4943', fontSize:14, cursor:'pointer' }}>Cancel</button>
              <button onClick={() => { setPromos(prev => prev.filter(p => p.id !== deleteId)); setDeleteId(null); }} style={{ padding:'8px 20px', borderRadius:8, background:'#dc2626', color:'#fff', fontWeight:700, fontSize:14, border:'none', cursor:'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Promotions;
