'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PRODUCTS } from '../../../lib/data';

interface Props { activePage: string; onNav: (p: string) => void; }

const STOCK = (id: number) => (id * 17 + 3) % 120;
const CAT_LABELS: Record<string, string> = {
  beverages: 'Beverages', snacks: 'Snacks', food: 'Food',
  'personal-care': 'Personal Care', household: 'Household',
};
const CAT_COLORS: Record<string, { bg: string; color: string }> = {
  beverages: { bg: '#e0f5ed', color: '#004d38' },
  snacks:    { bg: '#fff3d6', color: '#7a5c00' },
  food:      { bg: '#fef3c7', color: '#92400e' },
  'personal-care': { bg: '#ede9fe', color: '#4c1d95' },
  household: { bg: '#e0f2fe', color: '#075985' },
};
const lowStockProducts = [...PRODUCTS]
  .map(p => ({ ...p, stock: STOCK(p.id) }))
  .sort((a, b) => a.stock - b.stock)
  .slice(0, 4);

const pageCSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Hanken+Grotesk:wght@600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
body { font-family: 'Inter', sans-serif; }
.font-hanken { font-family: 'Hanken Grotesk', sans-serif; }
.material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
aside { border-right: 2px solid #ffe08a; background: linear-gradient(180deg, #f4fbf7 0%, #fffdf5 100%); }
.nav-active { background: linear-gradient(90deg, #fff3d6 0%, #fde68a44 100%) !important; border-left: 3px solid #f59e0b; color: #00694c !important; font-weight: 700; }
header { background: linear-gradient(90deg, #f7fbf9 0%, #fffdf5 100%); border-bottom: 1.5px solid #ffe08a; }
.stat-card { transition: transform 0.18s ease, box-shadow 0.18s ease; }
.stat-card:hover { transform: translateY(-2px); }
.fab { background: linear-gradient(135deg, #00694c 0%, #00a86b 100%); box-shadow: 0 4px 16px #00694c44; }
.fab:hover { box-shadow: 0 6px 24px #00694c66; }
tbody tr:hover { background: #f4fbf7 !important; }
.btn-amber { background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%); color: #431d00; font-weight: 600; box-shadow: 0 2px 8px #f59e0b44; transition: all 0.15s; }
.btn-amber:hover { background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); box-shadow: 0 4px 14px #f59e0b55; }
.search-bar { background: #fff8e6; border: 1.5px solid #fcd97a; border-radius: 999px; }
.search-bar input { background: transparent; }
.search-bar:focus-within { border-color: #f59e0b; box-shadow: 0 0 0 3px #f59e0b22; }
.brand-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: linear-gradient(135deg, #f59e0b, #00694c); margin-right: 6px; vertical-align: middle; }
`;

const navItems = [
  { id: 'dashboard',  label: 'Dashboard',  icon: 'dashboard' },
  { id: 'products',   label: 'Products',   icon: 'shopping_bag' },
  { id: 'categories', label: 'Categories', icon: 'category' },
  { id: 'orders',     label: 'Orders',     icon: 'receipt_long' },
  { id: 'inventory',  label: 'Inventory',  icon: 'inventory_2' },
  { id: 'promotions', label: 'Promotions', icon: 'campaign' },
  { id: 'users',      label: 'Users',      icon: 'group' },
  { id: 'pos',        label: 'POS',        icon: 'point_of_sale' },
  { id: 'settings',   label: 'Settings',   icon: 'settings' },
];

export default function DashboardPage({ activePage, onNav }: Props) {
  const router = useRouter();
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js';
    script.onload = () => {
      const revenueEl = document.getElementById('revenueChart') as HTMLCanvasElement;
      const donutEl = document.getElementById('donutChart') as HTMLCanvasElement;
      if (!revenueEl || !donutEl) return;

      // Destroy existing instances
      const ChartJS = (window as unknown as { Chart: { getChart: (el: HTMLCanvasElement) => { destroy: () => void } | undefined } }).Chart;
      const existingRevenue = ChartJS.getChart(revenueEl);
      if (existingRevenue) existingRevenue.destroy();
      const existingDonut = ChartJS.getChart(donutEl);
      if (existingDonut) existingDonut.destroy();

      const barData = [3.2, 4.1, 2.8, 5.0, 5.8, 3.9, 3.1];
      const barLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const maxVal = Math.max(...barData);
      const barCtx = revenueEl.getContext('2d')!;

      const gradientPeak = barCtx.createLinearGradient(0, 0, 0, 256);
      gradientPeak.addColorStop(0, '#4ade80');
      gradientPeak.addColorStop(1, '#00694c');

      const gradientMuted = barCtx.createLinearGradient(0, 0, 0, 256);
      gradientMuted.addColorStop(0, '#86efac');
      gradientMuted.addColorStop(1, '#00694c66');

      const gridPlugin = {
        id: 'customGrid',
        beforeDatasetsDraw(chart: { ctx: CanvasRenderingContext2D; chartArea: { left: number; right: number }; scales: { y: { ticks: { value: number }[]; getPixelForValue: (v: number) => number } } }) {
          const { ctx, chartArea: { left, right }, scales: { y } } = chart;
          ctx.save();
          y.ticks.forEach((tick, i) => {
            if (i === 0) return;
            const yPos = y.getPixelForValue(tick.value);
            ctx.beginPath();
            ctx.strokeStyle = '#c8e4d8';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.moveTo(left, yPos);
            ctx.lineTo(right, yPos);
            ctx.stroke();
          });
          ctx.restore();
        }
      };

      new (window as unknown as { Chart: new (...args: unknown[]) => unknown }).Chart(barCtx, {
        plugins: [gridPlugin],
        type: 'bar',
        data: {
          labels: barLabels,
          datasets: [{
            data: barData,
            backgroundColor: barData.map(v => v === maxVal ? gradientPeak : gradientMuted),
            borderRadius: 6,
            borderSkipped: false,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (ctx: { parsed: { y: number } }) => ctx.parsed.y + 'M VND' } }
          },
          layout: { padding: { top: 28 } },
          scales: {
            x: { grid: { display: false }, border: { display: false }, ticks: { font: { family: 'Inter', size: 12 }, color: '#3d4943' } },
            y: {
              border: { display: false },
              grid: { drawOnChartArea: false, drawTicks: false },
              ticks: { font: { family: 'Inter', size: 11 }, color: '#3d4943', padding: 8, callback: (val: unknown) => val + 'M', stepSize: 1 },
              beginAtZero: true, max: 7
            }
          },
          animation: {
            onComplete: function(this: { ctx: CanvasRenderingContext2D; data: { datasets: { data: number[] }[] }; getDatasetMeta: (i: number) => { data: { x: number; y: number }[] } }) {
              const chart = this;
              const c = chart.ctx;
              chart.data.datasets.forEach((dataset, i) => {
                chart.getDatasetMeta(i).data.forEach((bar, idx) => {
                  const val = dataset.data[idx];
                  c.fillStyle = '#191c1e';
                  c.font = '600 12px Inter';
                  c.textAlign = 'center';
                  c.textBaseline = 'bottom';
                  c.fillText(val + 'M', bar.x, bar.y - 4);
                  if (val === maxVal) {
                    c.font = '15px serif';
                    c.fillText('⭐', bar.x, bar.y - 20);
                  }
                });
              });
            }
          }
        }
      });

      new (window as unknown as { Chart: new (...args: unknown[]) => unknown }).Chart(donutEl.getContext('2d')!, {
        type: 'doughnut',
        data: {
          labels: ['POS (In-store)', 'Online'],
          datasets: [{ data: [82, 60], backgroundColor: ['#1d6fb8', '#f59e0b'], borderWidth: 0, hoverOffset: 6 }]
        },
        options: {
          responsive: true, maintainAspectRatio: true, cutout: '72%',
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (ctx: { label: string; parsed: number }) => ` ${ctx.label}: ${ctx.parsed} orders` } }
          }
        }
      });
    };
    document.head.appendChild(script);
    return () => {
      try { document.head.removeChild(script); } catch {}
    };
  }, []);

  return (
    <div className="bg-background text-on-surface" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{pageCSS}</style>

      {/* Sidebar */}
      <aside className="h-screen w-64 fixed left-0 top-0 z-40 border-r flex flex-col py-5 px-3 overflow-y-auto">
        <div className="mb-8 px-4">
          <h1 className="font-headline-sm text-headline-sm font-bold flex items-center" style={{ color: '#00694c' }}>
            <span className="brand-dot"></span>RetailPro
          </h1>
          <p className="font-label-md text-label-md text-on-surface-variant">Management System</p>
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              className={`flex items-center gap-3 px-4 py-3 transition-colors rounded-lg w-full text-left ${activePage === item.id ? 'nav-active' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-label-md text-label-md">{item.label}</span>
            </button>
          ))}
          <button onClick={() => router.push('/')} className="text-on-surface-variant flex items-center gap-3 px-4 py-3 hover:bg-surface-container-high transition-colors rounded-lg w-full text-left">
            <span className="material-symbols-outlined">home</span>
            <span className="font-label-md text-label-md">Home</span>
          </button>
        </nav>
        <div className="mt-auto p-4 border-t" style={{ borderColor: '#ffe08a' }}>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-on-surface-variant">help_outline</span>
            <div>
              <p className="font-bold text-on-surface" style={{ fontSize: '13px' }}>Need Help?</p>
              <p className="text-on-surface-variant" style={{ fontSize: '11px' }}>Check our documentation</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen flex flex-col">
        <header className="sticky top-0 w-full z-30 flex justify-between items-center px-8 py-4">
          <div className="flex items-center gap-4">
            <h2 className="font-headline-md text-headline-md font-bold" style={{ fontSize: '28px', color: '#00694c' }}>Dashboard</h2>
            <div className="search-bar hidden lg:flex items-center px-4 py-2 w-80 gap-2">
              <span className="material-symbols-outlined" style={{ color: '#b47b10', fontSize: '20px' }}>search</span>
              <input className="border-none focus:ring-0 w-full" style={{ fontSize: '14px', outline: 'none', background: 'transparent' }} placeholder="Search product name, barcode..." />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container rounded-full p-2 transition-all">notifications</button>
            <button className="material-symbols-outlined text-on-surface-variant hover:bg-surface-container rounded-full p-2 transition-all">help_outline</button>
            <div className="h-8 w-px mx-2" style={{ background: '#ffe08a' }}></div>
            <div className="flex items-center gap-2 px-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#00694c,#f59e0b)' }}>
                <span className="material-symbols-outlined text-white text-[16px]">person</span>
              </div>
              <div className="text-right">
                <p className="font-label-md text-label-md font-bold text-on-surface leading-none">ADMIN USER</p>
                <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">Store Manager</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-6 max-w-7xl">
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="stat-card bg-surface-container-lowest border rounded-xl p-6 flex flex-col justify-between" style={{ borderColor: '#b8e0cc', boxShadow: '0 0 0 1px #00694c1a, 0 4px 20px #00694c14' }}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-label-md text-label-md text-on-surface-variant mb-1">Total Revenue</p>
                  <h3 className="font-headline-md text-headline-md font-bold">25,000,000 VND</h3>
                </div>
                <span className="material-symbols-outlined p-2 rounded-lg" style={{ color: '#00694c', background: '#e0f5ed' }}>payments</span>
              </div>
              <div className="mt-4 flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]" style={{ color: '#00694c' }}>trending_up</span>
                <span className="font-label-sm text-label-sm" style={{ color: '#00694c' }}>+12% from last month</span>
              </div>
            </div>
            <div className="stat-card bg-surface-container-lowest border rounded-xl p-6 flex flex-col justify-between" style={{ borderColor: '#fcd97a', boxShadow: '0 0 0 1px #f59e0b1a, 0 4px 20px #f59e0b14' }}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-label-md text-label-md text-on-surface-variant mb-1">Total Orders</p>
                  <h3 className="font-headline-md text-headline-md font-bold">142</h3>
                </div>
                <span className="material-symbols-outlined p-2 rounded-lg" style={{ color: '#b47b10', background: '#fff3d6' }}>shopping_cart</span>
              </div>
              <div className="mt-4 flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]" style={{ color: '#b47b10' }}>trending_up</span>
                <span className="font-label-sm text-label-sm" style={{ color: '#b47b10' }}>+8% from last month</span>
              </div>
            </div>
            <div className="stat-card bg-surface-container-lowest border rounded-xl p-6 flex flex-col justify-between" style={{ borderColor: '#b8e0cc', boxShadow: '0 0 0 1px #00694c1a, 0 4px 20px #00694c14' }}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-label-md text-label-md text-on-surface-variant mb-1">New Customers</p>
                  <h3 className="font-headline-md text-headline-md font-bold">28</h3>
                </div>
                <span className="material-symbols-outlined p-2 rounded-lg" style={{ color: '#00694c', background: '#e0f5ed' }}>person_add</span>
              </div>
              <div className="mt-4 flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]" style={{ color: '#00694c' }}>trending_up</span>
                <span className="font-label-sm text-label-sm" style={{ color: '#00694c' }}>+5.2%</span>
              </div>
            </div>
            <div className="stat-card bg-surface-container-lowest border rounded-xl p-6 flex flex-col justify-between" style={{ borderColor: '#fac057', boxShadow: '0 0 0 1px #D9770622, 0 4px 20px #D9770618' }}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-label-md text-label-md text-on-surface-variant mb-1">Low Stock Products</p>
                  <h3 className="font-headline-md text-headline-md font-bold" style={{ color: '#854f0b' }}>{PRODUCTS.filter(p => STOCK(p.id) <= 10).length}</h3>
                </div>
                <span className="material-symbols-outlined p-2 rounded-lg" style={{ color: '#854f0b', background: '#fff3d6' }}>inventory</span>
              </div>
              <div className="mt-4 flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]" style={{ color: '#854f0b' }}>warning</span>
                <span className="font-label-sm text-label-sm font-medium" style={{ color: '#854f0b' }}>Requires attention</span>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-surface-container-lowest border rounded-xl p-6" style={{ borderColor: '#c8e4d8' }}>
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-headline-sm text-headline-sm">Revenue (Last 7 Days)</h4>
                <select className="bg-surface-container border-none rounded-lg font-label-md text-label-md py-1 px-3" style={{ background: '#fff3d6', color: '#7a5c00', border: '1.5px solid #fcd97a', fontSize: '13px' }}>
                  <option>This Week</option>
                  <option>Last Week</option>
                </select>
              </div>
              <div className="relative h-64">
                <canvas id="revenueChart"></canvas>
              </div>
            </div>
            <div className="bg-surface-container-lowest border rounded-xl p-6 flex flex-col" style={{ borderColor: '#c8e4d8' }}>
              <h4 className="font-headline-sm text-headline-sm mb-1">Sales Channel</h4>
              <p className="font-label-sm text-label-sm text-on-surface-variant mb-4">Online vs POS today</p>
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative w-44 h-44">
                  <canvas id="donutChart"></canvas>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span style={{ fontSize: '11px', color: '#3d4943', textTransform: 'uppercase', letterSpacing: '.05em' }}>Total</span>
                    <span style={{ fontSize: '24px', fontWeight: 700, color: '#191c1e', lineHeight: 1.2 }}>142</span>
                    <span style={{ fontSize: '11px', color: '#3d4943' }}>orders</span>
                  </div>
                </div>
                <div className="mt-6 w-full space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: '#1d6fb8' }}></div>
                      <span className="font-body-sm text-body-sm">POS (In-store)</span>
                    </div>
                    <div className="text-right">
                      <span className="font-label-md text-label-md font-bold">82</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant ml-1">58%</span>
                    </div>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: '58%', background: '#1d6fb8' }}></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: '#f59e0b' }}></div>
                      <span className="font-body-sm text-body-sm">Online</span>
                    </div>
                    <div className="text-right">
                      <span className="font-label-md text-label-md font-bold">60</span>
                      <span className="font-label-sm text-label-sm text-on-surface-variant ml-1">42%</span>
                    </div>
                  </div>
                  <div className="w-full bg-surface-container rounded-full h-1.5">
                    <div className="h-1.5 rounded-full" style={{ width: '42%', background: '#f59e0b' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tables Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <div className="bg-surface-container-lowest border rounded-xl overflow-hidden" style={{ borderColor: '#c8e4d8' }}>
              <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: '#c8e4d8' }}>
                <h4 className="font-headline-sm text-headline-sm">Recent Orders</h4>
                <button className="font-label-md text-label-md hover:underline" style={{ color: '#00694c' }} onClick={() => onNav('orders')}>View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead style={{ background: '#f4fbf7' }}>
                    <tr>
                      <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Order ID</th>
                      <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Customer</th>
                      <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Amount</th>
                      <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: '#c8e4d8' }}>
                    <tr className="transition-colors">
                      <td className="px-6 py-4 font-body-sm text-body-sm">#ORD-2584</td>
                      <td className="px-6 py-4 font-body-sm text-body-sm">Minh Hoang</td>
                      <td className="px-6 py-4 font-body-sm text-body-sm">1,250,000 VND</td>
                      <td className="px-6 py-4"><span className="px-3 py-1 rounded-full text-[12px] font-bold" style={{ background: '#e0f5ed', color: '#004d38' }}>Delivered</span></td>
                    </tr>
                    <tr className="transition-colors">
                      <td className="px-6 py-4 font-body-sm text-body-sm">#ORD-2583</td>
                      <td className="px-6 py-4 font-body-sm text-body-sm">Phuong Linh</td>
                      <td className="px-6 py-4 font-body-sm text-body-sm">850,000 VND</td>
                      <td className="px-6 py-4"><span className="px-3 py-1 rounded-full text-[12px] font-bold" style={{ background: '#fff3d6', color: '#7a5c00' }}>Processing</span></td>
                    </tr>
                    <tr className="transition-colors">
                      <td className="px-6 py-4 font-body-sm text-body-sm">#ORD-2582</td>
                      <td className="px-6 py-4 font-body-sm text-body-sm">Tran Anh</td>
                      <td className="px-6 py-4 font-body-sm text-body-sm">2,100,000 VND</td>
                      <td className="px-6 py-4"><span className="px-3 py-1 rounded-full text-[12px] font-bold" style={{ background: '#fde68a', color: '#78350f' }}>Pending</span></td>
                    </tr>
                    <tr className="transition-colors">
                      <td className="px-6 py-4 font-body-sm text-body-sm">#ORD-2581</td>
                      <td className="px-6 py-4 font-body-sm text-body-sm">Duc Huy</td>
                      <td className="px-6 py-4 font-body-sm text-body-sm">450,000 VND</td>
                      <td className="px-6 py-4"><span className="px-3 py-1 rounded-full text-[12px] font-bold" style={{ background: '#FECACA', color: '#7F1D1D' }}>Cancelled</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-surface-container-lowest border rounded-xl overflow-hidden" style={{ borderColor: '#c8e4d8' }}>
              <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: '#c8e4d8' }}>
                <h4 className="font-headline-sm text-headline-sm">Low Stock Alert</h4>
                <button className="btn-amber px-4 py-2 rounded-lg font-label-md text-label-md">Restock All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead style={{ background: '#f4fbf7' }}>
                    <tr>
                      <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Product Name</th>
                      <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase">Category</th>
                      <th className="px-6 py-3 font-label-sm text-label-sm text-on-surface-variant uppercase text-right">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: '#c8e4d8' }}>
                    {lowStockProducts.map(p => {
                      const cc = CAT_COLORS[p.category] ?? { bg: '#e0f5ed', color: '#004d38' };
                      const stockColor = p.stock === 0 ? '#dc2626' : p.stock <= 10 ? '#854f0b' : undefined;
                      return (
                        <tr key={p.id} className="transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div style={{ width: 32, height: 32, borderRadius: 6, background: '#e0f5ed', overflow: 'hidden', flexShrink: 0 }}>
                                <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 3 }} />
                              </div>
                              <div>
                                <p className="font-body-sm text-body-sm font-medium">{p.name}</p>
                                <p className="text-[11px] text-on-surface-variant">{CAT_LABELS[p.category]}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span style={{ background: cc.bg, color: cc.color, padding: '2px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600 }}>
                              {CAT_LABELS[p.category]}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-label-md text-label-md text-right font-bold" style={{ color: stockColor }}>{p.stock} units</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-auto p-8 text-center border-t" style={{ borderColor: '#c8e4d8' }}>
          <p className="font-body-sm text-body-sm text-on-surface-variant">© 2024 RetailPro Management System. All rights reserved.</p>
        </footer>
      </main>

      <button className="fab fixed bottom-8 right-8 w-14 h-14 text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50">
        <span className="material-symbols-outlined">add</span>
      </button>
    </div>
  );
}
