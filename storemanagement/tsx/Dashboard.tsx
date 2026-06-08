import React, { useEffect, useRef } from 'react';
import Layout from '../components/Layout';

declare global {
  interface Window {
    Chart: any;
  }
}

const Dashboard: React.FC = () => {
  const barRef = useRef<HTMLCanvasElement>(null);
  const donutRef = useRef<HTMLCanvasElement>(null);
  const chartsInitialized = useRef(false);

  useEffect(() => {
    if (chartsInitialized.current) return;
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js';
    script.onload = () => {
      chartsInitialized.current = true;
      if (!barRef.current || !donutRef.current) return;
      const barData = [3.2, 4.1, 2.8, 5.0, 5.8, 3.9, 3.1];
      const barLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const maxVal = Math.max(...barData);
      const barCtx = barRef.current.getContext('2d')!;
      const gPeak = barCtx.createLinearGradient(0, 0, 0, 256);
      gPeak.addColorStop(0, '#4ade80'); gPeak.addColorStop(1, '#00694c');
      const gMuted = barCtx.createLinearGradient(0, 0, 0, 256);
      gMuted.addColorStop(0, '#86efac'); gMuted.addColorStop(1, '#00694c66');
      const gridPlugin = {
        id: 'customGrid',
        beforeDatasetsDraw(chart: any) {
          const { ctx, chartArea: { left, right }, scales: { y } } = chart;
          ctx.save();
          y.ticks.forEach((tick: any, i: number) => {
            if (i === 0) return;
            const yPos = y.getPixelForValue(tick.value);
            ctx.beginPath(); ctx.strokeStyle = '#c8e4d8'; ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]); ctx.moveTo(left, yPos); ctx.lineTo(right, yPos); ctx.stroke();
          });
          ctx.restore();
        }
      };
      new window.Chart(barCtx, {
        plugins: [gridPlugin], type: 'bar',
        data: { labels: barLabels, datasets: [{ data: barData, backgroundColor: barData.map(v => v === maxVal ? gPeak : gMuted), borderRadius: 6, borderSkipped: false }] },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c: any) => c.parsed.y + 'M VND' } } },
          layout: { padding: { top: 28 } },
          scales: {
            x: { grid: { display: false }, border: { display: false }, ticks: { font: { family: 'Inter', size: 12 }, color: '#3d4943' } },
            y: { border: { display: false }, grid: { drawOnChartArea: false, drawTicks: false }, ticks: { font: { family: 'Inter', size: 11 }, color: '#3d4943', padding: 8, callback: (v: any) => v + 'M', stepSize: 1 }, beginAtZero: true, max: 7 }
          },
          animation: {
            onComplete: function (this: any) {
              const chart = this; const c = chart.ctx;
              chart.data.datasets.forEach((dataset: any, i: number) => {
                chart.getDatasetMeta(i).data.forEach((bar: any, idx: number) => {
                  const val = dataset.data[idx];
                  c.fillStyle = '#191c1e'; c.font = '600 12px Inter'; c.textAlign = 'center'; c.textBaseline = 'bottom';
                  c.fillText(val + 'M', bar.x, bar.y - 4);
                  if (val === maxVal) { c.font = '15px serif'; c.fillText('⭐', bar.x, bar.y - 20); }
                });
              });
            }
          }
        }
      });
      new window.Chart(donutRef.current.getContext('2d'), {
        type: 'doughnut',
        data: { labels: ['POS (In-store)', 'Online'], datasets: [{ data: [82, 60], backgroundColor: ['#1d6fb8', '#f59e0b'], borderWidth: 0, hoverOffset: 6 }] },
        options: { responsive: true, maintainAspectRatio: true, cutout: '72%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c: any) => ` ${c.label}: ${c.parsed} orders` } } } }
      });
    };
    document.head.appendChild(script);
    return () => { /* cleanup */ };
  }, []);

  const statCards = [
    { label: 'Total Revenue', value: '25,000,000 VND', icon: 'payments', trend: '+12% from last month', borderColor: '#b8e0cc', iconBg: '#e0f5ed', iconColor: '#00694c', trendColor: '#00694c', shadow: '0 0 0 1px #00694c1a, 0 4px 20px #00694c14' },
    { label: 'Total Orders', value: '142', icon: 'shopping_cart', trend: '+8% from last month', borderColor: '#fcd97a', iconBg: '#fff3d6', iconColor: '#b47b10', trendColor: '#b47b10', shadow: '0 0 0 1px #f59e0b1a, 0 4px 20px #f59e0b14', trendIcon: 'trending_up' },
    { label: 'New Customers', value: '28', icon: 'person_add', trend: '+5.2%', borderColor: '#b8e0cc', iconBg: '#e0f5ed', iconColor: '#00694c', trendColor: '#00694c', shadow: '0 0 0 1px #00694c1a, 0 4px 20px #00694c14' },
    { label: 'Low Stock Products', value: '5', icon: 'inventory', trend: 'Requires attention', borderColor: '#fac057', iconBg: '#fff3d6', iconColor: '#854f0b', trendColor: '#854f0b', shadow: '0 0 0 1px #D9770622, 0 4px 20px #D9770618', trendIcon: 'warning', valueColor: '#854f0b' },
  ];

  const recentOrders = [
    { id: '#ORD-2584', customer: 'Minh Hoang', amount: '1,250,000 VND', status: 'Delivered', statusBg: '#e0f5ed', statusColor: '#004d38' },
    { id: '#ORD-2583', customer: 'Phuong Linh', amount: '850,000 VND', status: 'Processing', statusBg: '#fff3d6', statusColor: '#7a5c00' },
    { id: '#ORD-2582', customer: 'Tran Anh', amount: '2,100,000 VND', status: 'Pending', statusBg: '#fde68a', statusColor: '#78350f' },
    { id: '#ORD-2581', customer: 'Duc Huy', amount: '450,000 VND', status: 'Cancelled', statusBg: '#FECACA', statusColor: '#7F1D1D' },
  ];

  const lowStockItems = [
    { name: 'Arabica Coffee Beans 1kg', cat: 'Beverages', stock: '2 units', stockColor: '#ba1a1a' },
    { name: 'Eco-friendly Straws (Pack 50)', cat: 'Supplies', stock: '0 units', stockColor: '#ba1a1a' },
    { name: 'Banh Mi Flour Special', cat: 'Bakery', stock: '12 units', stockColor: '#854f0b' },
    { name: 'Coconut Milk Organic', cat: 'Groceries', stock: '8 units', stockColor: '#854f0b' },
  ];

  return (
    <Layout activePage="dashboard" title="Dashboard" searchPlaceholder="Search product name, barcode...">
      <div style={{ padding: 32, maxWidth: 1400 }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 24 }}>
          {statCards.map((c, i) => (
            <div key={i} className="stat-card" style={{ background: '#fff', border: `1px solid ${c.borderColor}`, borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: c.shadow, transition: 'transform 0.18s ease' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = '')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: 14, lineHeight: '16px', letterSpacing: '0.01em', fontWeight: 500, color: '#3d4943', marginBottom: 4 }}>{c.label}</p>
                  <h3 style={{ fontSize: 24, lineHeight: '32px', fontWeight: 700, color: c.valueColor || '#191c1e' }}>{c.value}</h3>
                </div>
                <span className="material-symbols-outlined" style={{ padding: 8, borderRadius: 8, color: c.iconColor, background: c.iconBg }}>{c.icon}</span>
              </div>
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="material-symbols-outlined" style={{ color: c.trendColor, fontSize: 18 }}>{c.trendIcon || 'trending_up'}</span>
                <span style={{ fontSize: 10, lineHeight: '14px', fontWeight: 600, color: c.trendColor }}>{c.trend}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
          <div style={{ background: '#fff', border: '1px solid #c8e4d8', borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <h4 style={{ fontSize: 20, lineHeight: '28px', fontWeight: 600 }}>Revenue (Last 7 Days)</h4>
              <select style={{ background: '#fff3d6', color: '#7a5c00', border: '1.5px solid #fcd97a', borderRadius: 8, padding: '4px 12px', fontSize: 13 }}>
                <option>This Week</option><option>Last Week</option>
              </select>
            </div>
            <div style={{ position: 'relative', height: 256 }}>
              <canvas ref={barRef} id="revenueChart" />
            </div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #c8e4d8', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ fontSize: 20, lineHeight: '28px', fontWeight: 600, marginBottom: 4 }}>Sales Channel</h4>
            <p style={{ fontSize: 10, lineHeight: '14px', fontWeight: 600, color: '#3d4943', marginBottom: 24 }}>Online vs POS today</p>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'relative', width: 176, height: 176 }}>
                <canvas ref={donutRef} id="donutChart" />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <span style={{ fontSize: 11, color: '#3d4943', textTransform: 'uppercase', letterSpacing: '.05em' }}>Total</span>
                  <span style={{ fontSize: 24, fontWeight: 700, color: '#191c1e', lineHeight: 1.2 }}>142</span>
                  <span style={{ fontSize: 11, color: '#3d4943' }}>orders</span>
                </div>
              </div>
              <div style={{ marginTop: 24, width: '100%' }}>
                {[{ color: '#1d6fb8', label: 'POS (In-store)', val: 82, pct: 58 }, { color: '#f59e0b', label: 'Online', val: 60, pct: 42 }].map(ch => (
                  <div key={ch.label} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: ch.color }} />
                        <span style={{ fontSize: 12, lineHeight: '20px' }}>{ch.label}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 14, lineHeight: '16px', letterSpacing: '0.01em', fontWeight: 700 }}>{ch.val}</span>
                        <span style={{ fontSize: 10, lineHeight: '14px', fontWeight: 600, color: '#3d4943', marginLeft: 4 }}>{ch.pct}%</span>
                      </div>
                    </div>
                    <div style={{ width: '100%', background: '#edf7f2', borderRadius: 999, height: 6 }}>
                      <div style={{ height: 6, borderRadius: 999, background: ch.color, width: `${ch.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tables */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Recent Orders */}
          <div style={{ background: '#fff', border: '1px solid #c8e4d8', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: 24, borderBottom: '1px solid #c8e4d8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontSize: 20, lineHeight: '28px', fontWeight: 600 }}>Recent Orders</h4>
              <button style={{ color: '#00694c', fontSize: 14, lineHeight: '16px', letterSpacing: '0.01em', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#f4fbf7' }}>
                  <tr>{['Order ID', 'Customer', 'Amount', 'Status'].map(h => <th key={h} style={{ padding: '12px 24px', fontSize: 10, lineHeight: '14px', fontWeight: 600, color: '#3d4943', textTransform: 'uppercase' }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {recentOrders.map((o, i) => (
                    <tr key={i} style={{ borderTop: '1px solid #c8e4d8' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f4fbf7')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}>
                      <td style={{ padding: '16px 24px', fontSize: 12, lineHeight: '20px' }}>{o.id}</td>
                      <td style={{ padding: '16px 24px', fontSize: 12, lineHeight: '20px' }}>{o.customer}</td>
                      <td style={{ padding: '16px 24px', fontSize: 12, lineHeight: '20px' }}>{o.amount}</td>
                      <td style={{ padding: '16px 24px' }}><span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: o.statusBg, color: o.statusColor }}>{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {/* Low Stock */}
          <div style={{ background: '#fff', border: '1px solid #c8e4d8', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: 24, borderBottom: '1px solid #c8e4d8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontSize: 20, lineHeight: '28px', fontWeight: 600 }}>Low Stock Alert</h4>
              <button style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', color: '#431d00', fontWeight: 600, boxShadow: '0 2px 8px #f59e0b44', padding: '8px 16px', borderRadius: 8, fontSize: 14, border: 'none', cursor: 'pointer' }}>Restock All</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: '#f4fbf7' }}>
                  <tr>{['Product Name', 'Category', 'Stock'].map((h, i) => <th key={h} style={{ padding: '12px 24px', fontSize: 10, lineHeight: '14px', fontWeight: 600, color: '#3d4943', textTransform: 'uppercase', textAlign: i === 2 ? 'right' : 'left' }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {lowStockItems.map((item, i) => (
                    <tr key={i} style={{ borderTop: '1px solid #c8e4d8' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f4fbf7')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}>
                      <td style={{ padding: '16px 24px' }}>
                        <p style={{ fontSize: 12, lineHeight: '20px', fontWeight: 500 }}>{item.name}</p>
                        <p style={{ fontSize: 11, color: '#3d4943' }}>{item.cat}</p>
                      </td>
                      <td style={{ padding: '16px 24px', fontSize: 12, color: '#3d4943' }}>{item.cat}</td>
                      <td style={{ padding: '16px 24px', fontSize: 14, lineHeight: '16px', letterSpacing: '0.01em', fontWeight: 700, textAlign: 'right', color: item.stockColor }}>{item.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* FAB */}
      <button style={{ position: 'fixed', bottom: 32, right: 32, width: 56, height: 56, background: 'linear-gradient(135deg, #00694c 0%, #00a86b 100%)', boxShadow: '0 4px 16px #00694c44', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', zIndex: 50, transition: 'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 24px #00694c66'; e.currentTarget.style.transform = 'scale(1.05)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 16px #00694c44'; e.currentTarget.style.transform = ''; }}>
        <span className="material-symbols-outlined">add</span>
      </button>
    </Layout>
  );
};

export default Dashboard;
