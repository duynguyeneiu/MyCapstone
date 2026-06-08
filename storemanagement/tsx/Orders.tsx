import React, { useState } from 'react';
import Layout from '../components/Layout';

interface OrderItem { name: string; qty: number; price: number; }
interface Order {
  id: number; oid: string; customer: string; phone: string; address: string;
  date: string; channel: 'Online' | 'POS'; payment: string; amount: number;
  discount: number; status: string; items: OrderItem[];
}

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + '₫';

const statusConfig: Record<string, { bg: string; color: string }> = {
  'Pending':    { bg: '#fff3d6', color: '#7a5c00' },
  'Processing': { bg: '#fff3d6', color: '#b47b10' },
  'Shipped':    { bg: '#e0f5ed', color: '#004d38' },
  'Delivered':  { bg: '#e0f5ed', color: '#004d38' },
  'Paid':       { bg: '#e0f5ed', color: '#004d38' },
  'Refunded':   { bg: '#fce7f3', color: '#831843' },
  'Cancelled':  { bg: '#fee2e2', color: '#7f1d1d' },
};

const payIcon: Record<string, string> = {
  'Cash': 'payments', 'Bank Transfer': 'account_balance', 'VNPay': 'qr_code', 'COD': 'local_shipping'
};

const initialOrders: Order[] = [
  { id:1, oid:'#ORD-2584', customer:'Minh Hoang', phone:'0901234567', address:'123 Le Loi, Q1, TP.HCM', date:'24 May 2024 09:32', channel:'Online', payment:'VNPay', amount:1250000, discount:0, status:'Delivered', items:[{name:'Wireless Earbuds Pro',qty:1,price:490000},{name:'USB-C Hub 7-in-1',qty:1,price:750000}] },
  { id:2, oid:'#ORD-2583', customer:'Phuong Linh', phone:'0912345678', address:'45 Nguyen Hue, Q1, TP.HCM', date:'24 May 2024 08:15', channel:'Online', payment:'Bank Transfer', amount:850000, discount:50000, status:'Processing', items:[{name:'Sunscreen SPF50+',qty:2,price:195000},{name:'Face Wash Foam',qty:1,price:110000},{name:'Green Tea 500ml',qty:3,price:15000}] },
  { id:3, oid:'#ORD-2582', customer:'Tran Anh', phone:'0923456789', address:'78 Hai Ba Trung, Q3, TP.HCM', date:'24 May 2024 07:50', channel:'POS', payment:'Cash', amount:2100000, discount:100000, status:'Paid', items:[{name:'USB-C Hub 7-in-1',qty:2,price:750000},{name:'Wireless Earbuds Pro',qty:1,price:490000}] },
  { id:4, oid:'#ORD-2581', customer:'Duc Huy', phone:'0934567890', address:'POS Counter', date:'23 May 2024 17:20', channel:'POS', payment:'Cash', amount:450000, discount:0, status:'Cancelled', items:[{name:'Dish Soap 750ml',qty:3,price:38000},{name:'Floor Cleaner 1L',qty:2,price:58000}] },
  { id:5, oid:'#ORD-2580', customer:'Lan Anh', phone:'0945678901', address:'22 Vo Thi Sau, Q3, TP.HCM', date:'23 May 2024 15:10', channel:'Online', payment:'VNPay', amount:980000, discount:0, status:'Shipped', items:[{name:'Sunscreen SPF50+',qty:3,price:195000},{name:'Face Wash Foam',qty:3,price:110000}] },
  { id:6, oid:'#ORD-2579', customer:'Bao Long', phone:'0956789012', address:'POS Counter', date:'23 May 2024 12:30', channel:'POS', payment:'Cash', amount:320000, discount:20000, status:'Paid', items:[{name:'Green Tea 500ml',qty:10,price:15000},{name:'Instant Noodles Pack',qty:20,price:7000}] },
  { id:7, oid:'#ORD-2578', customer:'Thu Hang', phone:'0967890123', address:'55 Dien Bien Phu, Binh Thanh', date:'23 May 2024 10:05', channel:'Online', payment:'COD', amount:1560000, discount:0, status:'Pending', items:[{name:'Wireless Earbuds Pro',qty:2,price:490000},{name:'Floor Cleaner 1L',qty:2,price:58000}] },
  { id:8, oid:'#ORD-2577', customer:'Quoc Viet', phone:'0978901234', address:'POS Counter', date:'23 May 2024 09:00', channel:'POS', payment:'Bank Transfer', amount:760000, discount:0, status:'Refunded', items:[{name:'USB-C Hub 7-in-1',qty:1,price:750000}] },
];

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const c = statusConfig[status] || statusConfig['Pending'];
  return <span style={{ background: c.bg, color: c.color, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>{status}</span>;
};

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('');
  const [typeF, setTypeF] = useState('');
  const [payF, setPayF] = useState('');
  const [detail, setDetail] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');

  const filtered = orders.filter(o =>
    (!search || o.oid.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase())) &&
    (!statusF || o.status === statusF) &&
    (!typeF || o.channel === typeF) &&
    (!payF || o.payment === payF)
  );

  const openDetail = (o: Order) => { setDetail(o); setNewStatus(o.status); };
  const updateStatus = () => {
    if (!detail) return;
    setOrders(prev => prev.map(o => o.id === detail.id ? { ...o, status: newStatus } : o));
    setDetail(null);
  };

  const statCards = [
    { label: 'Total Orders Today', value: 47, icon: 'receipt_long', trend: '+12% from yesterday', borderColor: '#b8e0cc', iconBg: '#e0f5ed', iconColor: '#00694c', trendColor: '#00694c', trendIcon: 'trending_up', shadow: '0 0 0 1px #00694c1a, 0 4px 20px #00694c14' },
    { label: 'Pending', value: 12, icon: 'hourglass_empty', trend: 'Awaiting processing', borderColor: '#fcd97a', iconBg: '#fff3d6', iconColor: '#b47b10', trendColor: '#b47b10', shadow: '0 0 0 1px #f59e0b1a, 0 4px 20px #f59e0b14' },
    { label: 'Delivered', value: 28, icon: 'local_shipping', trend: 'Completed today', borderColor: '#b8e0cc', iconBg: '#e0f5ed', iconColor: '#00694c', trendColor: '#00694c', shadow: '0 0 0 1px #00694c1a, 0 4px 20px #00694c14' },
    { label: 'Cancelled', value: 7, icon: 'cancel', trend: 'Today', borderColor: '#fca5a5', iconBg: '#fee2e2', iconColor: '#dc2626', trendColor: '#dc2626', shadow: '0 0 0 1px #dc262622, 0 4px 20px #dc262614', valueColor: '#dc2626' },
  ];

  const selStyle: React.CSSProperties = { background: '#fff8e6', border: '1.5px solid #fcd97a', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#3d4943', outline: 'none' };

  return (
    <Layout activePage="orders" title="Orders" searchPlaceholder="Search order ID, customer..." onSearch={setSearch}>
      <div style={{ padding: 32 }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, marginBottom: 24 }}>
          {statCards.map((c, i) => (
            <div key={i} style={{ background: '#fff', border: `1px solid ${c.borderColor}`, borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: c.shadow, transition: 'transform 0.18s' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = '')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#3d4943', marginBottom: 4 }}>{c.label}</p>
                  <h3 style={{ fontSize: 24, fontWeight: 700, color: c.valueColor || '#191c1e' }}>{c.value}</h3>
                </div>
                <span className="material-symbols-outlined" style={{ padding: 8, borderRadius: 8, color: c.iconColor, background: c.iconBg }}>{c.icon}</span>
              </div>
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 4 }}>
                {c.trendIcon && <span className="material-symbols-outlined" style={{ color: c.trendColor, fontSize: 18 }}>{c.trendIcon}</span>}
                <span style={{ fontSize: 10, fontWeight: 600, color: c.trendColor }}>{c.trend}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: '#fff', border: '1px solid #c8e4d8', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: 24, borderBottom: '1px solid #c8e4d8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <select value={statusF} onChange={e => setStatusF(e.target.value)} style={selStyle}>
                <option value="">All Status</option>
                <optgroup label="── Online ──">
                  {['Pending','Processing','Shipped','Delivered'].map(s => <option key={s}>{s}</option>)}
                </optgroup>
                <optgroup label="── POS ──">
                  {['Paid','Refunded'].map(s => <option key={s}>{s}</option>)}
                </optgroup>
                <option>Cancelled</option>
              </select>
              <select value={typeF} onChange={e => setTypeF(e.target.value)} style={selStyle}>
                <option value="">All Channels</option><option>Online</option><option>POS</option>
              </select>
              <select value={payF} onChange={e => setPayF(e.target.value)} style={selStyle}>
                <option value="">All Payments</option>
                {['Cash','Bank Transfer','VNPay','COD'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 8, border: '1px solid #c8e4d8', background: 'none', color: '#3d4943', fontSize: 14, cursor: 'pointer' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>download</span>Export
            </button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: '#f4fbf7' }}>
                <tr>
                  <th style={{ padding: '12px 16px', width: 40 }}><input type="checkbox" /></th>
                  {['Order ID','Customer','Date','Channel','Payment','Amount','Order Status','Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', fontSize: 10, fontWeight: 600, color: '#3d4943', textTransform: 'uppercase', textAlign: h === 'Actions' ? 'center' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} style={{ borderTop: '1px solid #c8e4d8' }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#f4fbf7')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}>
                    <td style={{ padding: '12px 16px' }}><input type="checkbox" /></td>
                    <td style={{ padding: '12px 16px' }}><p style={{ fontWeight: 700, fontSize: 13 }}>{o.oid}</p></td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#00694c,#00a86b)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                          {o.customer.split(' ').map(w => w[0]).slice(-2).join('')}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 13 }}>{o.customer}</p>
                          <p style={{ color: '#3d4943', fontSize: 11 }}>{o.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#3d4943', fontSize: 12 }}>{o.date}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {o.channel === 'Online'
                        ? <span style={{ background: '#fff3d6', color: '#7a5c00', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>🌐 Online</span>
                        : <span style={{ background: '#e0f5ed', color: '#004d38', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>🏪 POS</span>}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span className="material-symbols-outlined" style={{ color: '#3d4943', fontSize: 15 }}>{payIcon[o.payment] || 'payments'}</span>
                        <span style={{ color: '#3d4943', fontSize: 12 }}>{o.payment}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, fontSize: 13 }}>{fmt(o.amount)}</td>
                    <td style={{ padding: '12px 16px' }}><StatusBadge status={o.status} /></td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button onClick={() => openDetail(o)}
                        style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #c8e4d8', background: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', margin: '0 auto' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#e0f5ed'; e.currentTarget.style.borderColor = '#00694c'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.borderColor = '#c8e4d8'; }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#3d4943' }}>visibility</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '16px 24px', borderTop: '1px solid #c8e4d8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ color: '#3d4943', fontSize: 13 }}>Showing {filtered.length} of {orders.length} orders</p>
            <div style={{ display: 'flex', gap: 4 }}>
              {[{ icon: 'chevron_left' }, { page: 1, active: true }, { page: 2 }, { page: 3 }, { icon: 'chevron_right' }].map((btn, i) => (
                <button key={i} style={{ width: 32, height: 32, borderRadius: 8, border: (btn as any).active ? 'none' : '1px solid #c8e4d8', background: (btn as any).active ? 'linear-gradient(135deg,#00694c,#00a86b)' : 'none', color: (btn as any).active ? '#fff' : '#191c1e', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 13, fontWeight: (btn as any).active ? 700 : 400 }}>
                  {(btn as any).icon ? <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{(btn as any).icon}</span> : (btn as any).page}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={e => e.target === e.currentTarget && setDetail(null)}>
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #c8e4d8', width: 560, maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ padding: 24, borderBottom: '1px solid #c8e4d8', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: 18 }}>Order {detail.oid}</h3>
                <p style={{ color: '#3d4943', fontSize: 12 }}>{detail.date}</p>
              </div>
              <button onClick={() => setDetail(null)} className="material-symbols-outlined" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3d4943' }}>close</button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ background: '#f4fbf7', border: '1px solid #c8e4d8', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Customer Information</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><p style={{ color: '#3d4943', fontSize: 11 }}>Name</p><p style={{ fontWeight: 700, fontSize: 13 }}>{detail.customer}</p></div>
                  <div><p style={{ color: '#3d4943', fontSize: 11 }}>Phone</p><p style={{ fontWeight: 700, fontSize: 13 }}>{detail.phone}</p></div>
                  <div style={{ gridColumn: '1 / -1' }}><p style={{ color: '#3d4943', fontSize: 11 }}>Shipping Address</p><p style={{ fontWeight: 700, fontSize: 13 }}>{detail.address}</p></div>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Order Items</p>
                <table style={{ width: '100%', fontSize: 13 }}>
                  <thead><tr style={{ borderBottom: '1px solid #c8e4d8' }}>
                    {['Product','Qty','Price','Subtotal'].map((h, i) => <th key={h} style={{ padding: '8px 0', color: '#3d4943', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', textAlign: i === 0 ? 'left' : i === 1 ? 'center' : 'right' }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {detail.items.map((item, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #c8e4d8' }}>
                        <td style={{ padding: '8px 0' }}>{item.name}</td>
                        <td style={{ padding: '8px 0', textAlign: 'center', color: '#3d4943' }}>{item.qty}</td>
                        <td style={{ padding: '8px 0', textAlign: 'right', color: '#3d4943' }}>{fmt(item.price)}</td>
                        <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 700 }}>{fmt(item.qty * item.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(() => {
                const subtotal = detail.items.reduce((s, i) => s + i.qty * i.price, 0);
                const vat = Math.round((subtotal - detail.discount) * 0.1);
                const total = subtotal - detail.discount + vat;
                return (
                  <div style={{ background: '#f4fbf7', border: '1px solid #c8e4d8', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                    {[['Subtotal', fmt(subtotal)], ['Discount', detail.discount ? `-${fmt(detail.discount)}` : '—'], ['VAT (10%)', fmt(vat)]].map(([l, v]) => (
                      <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                        <span style={{ color: '#3d4943' }}>{l}</span><span>{v}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #c8e4d8', paddingTop: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>Total</span>
                      <span style={{ fontWeight: 700, fontSize: 14, color: '#00694c' }}>{fmt(total)}</span>
                    </div>
                  </div>
                );
              })()}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div style={{ background: '#fff8e6', border: '1px solid #fcd97a', borderRadius: 12, padding: 16 }}>
                  <p style={{ color: '#3d4943', fontSize: 11, marginBottom: 4 }}>Payment Method</p>
                  <p style={{ fontWeight: 700, fontSize: 13 }}>{detail.payment}</p>
                </div>
                <div style={{ background: '#f4fbf7', border: '1px solid #c8e4d8', borderRadius: 12, padding: 16 }}>
                  <p style={{ color: '#3d4943', fontSize: 11, marginBottom: 4 }}>Channel</p>
                  <p style={{ fontWeight: 700, fontSize: 13 }}>{detail.channel}</p>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#3d4943', marginBottom: 4 }}>Update Order Status</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                  style={{ width: '100%', border: '1.5px solid #c8e4d8', borderRadius: 8, padding: '8px 12px', fontSize: 14, background: '#f4fbf7', outline: 'none' }}>
                  <optgroup label="── Online ──">
                    {['Pending','Processing','Shipped','Delivered'].map(s => <option key={s}>{s}</option>)}
                  </optgroup>
                  <optgroup label="── POS ──">
                    {['Paid','Refunded'].map(s => <option key={s}>{s}</option>)}
                  </optgroup>
                  <option>Cancelled</option>
                </select>
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #c8e4d8', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setDetail(null)} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #c8e4d8', background: 'none', color: '#3d4943', fontSize: 14, cursor: 'pointer' }}>Close</button>
              <button onClick={updateStatus} style={{ padding: '8px 16px', borderRadius: 8, background: 'linear-gradient(135deg,#00694c,#00a86b)', color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>Update Status</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Orders;
