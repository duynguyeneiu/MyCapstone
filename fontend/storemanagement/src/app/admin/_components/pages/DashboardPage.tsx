'use client';

import { useEffect, useMemo, useState } from 'react';
import { orderService, Order } from '@/src/services/orderService';
import { productService } from '@/src/services/productService';
import { categoryService } from '@/src/services/categoryService';
import { userService } from '@/src/services/userService';
import { Product, Category } from '@/src/lib/data';

interface Props { onNav: (p: string) => void; search: string; }

const STATUS_OPTIONS = ['Pending', 'Shipping', 'Delivered'];
const CAT_COLORS = ['#e0f5ed', '#fff3d6', '#fef3c7', '#ede9fe', '#e0f2fe'];
const CAT_TEXT_COLORS = ['#004d38', '#7a5c00', '#92400e', '#4c1d95', '#075985'];
const CHANNEL_COLORS = ['#1d6fb8', '#f59e0b', '#16a34a', '#7c3aed', '#dc2626'];

const pageCSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Hanken+Grotesk:wght@600;700&display=swap');
.font-hanken { font-family: 'Hanken Grotesk', sans-serif; }
`;

function fmtVND(n: number) {
  return n.toLocaleString() + ' VND';
}

function statusColors(status: string) {
  switch (status.toLowerCase()) {
    case 'delivered': return { bg: '#e0f5ed', color: '#004d38' };
    case 'shipping':  return { bg: '#dbeafe', color: '#1e40af' };
    case 'cancelled': return { bg: '#fecaca', color: '#7f1d1d' };
    default:          return { bg: '#fff3d6', color: '#7a5c00' };
  }
}

export default function DashboardPage({ onNav, search }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [ordersData, productsData, categoriesData, usersData] = await Promise.all([
          orderService.getAll(),
          productService.getAll(),
          categoryService.getAll(),
          userService.getAll(),
        ]);
        setOrders(ordersData);
        setProducts(productsData);
        setCategories(categoriesData);
        setCustomerCount(
          usersData.filter((u) => u.role?.roleName?.toLowerCase() === 'customer').length
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleStatusChange = async (orderId: number, status: string) => {
    setUpdatingId(orderId);
    try {
      await orderService.updateStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, orderStatus: status } : o))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const totalRevenue = useMemo(() => orders.reduce((s, o) => s + o.totalAmount, 0), [orders]);
  const lowStockProducts = useMemo(
    () => [...products].sort((a, b) => a.quantity - b.quantity).slice(0, 6),
    [products]
  );
  const lowStockCount = useMemo(() => products.filter((p) => p.quantity <= 10).length, [products]);

  const q = search.trim().toLowerCase();

  const filteredOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
      .filter(
        (o) =>
          !q ||
          String(o.orderId).includes(q) ||
          o.receiverName.toLowerCase().includes(q) ||
          o.orderStatus.toLowerCase().includes(q)
      )
      .slice(0, 10);
  }, [orders, q]);

  const filteredLowStock = useMemo(() => {
    return lowStockProducts.filter((p) => {
      const catName = categories.find((c) => c.id === p.categoryId)?.name ?? '';
      return !q || p.name.toLowerCase().includes(q) || catName.toLowerCase().includes(q);
    });
  }, [lowStockProducts, categories, q]);

  // Real revenue for the last 7 calendar days, derived from actual orders.
  const revenueByDay = useMemo(() => {
    const days: { label: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toDateString();
      const total = orders
        .filter((o) => new Date(o.orderDate).toDateString() === key)
        .reduce((s, o) => s + o.totalAmount, 0);
      days.push({ label: d.toLocaleDateString('en-US', { weekday: 'short' }), total });
    }
    return days;
  }, [orders]);

  // Real sales-channel breakdown, grouped dynamically by whatever orderType
  // values the backend actually returns (no assumed fixed label set).
  const channelBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    orders.forEach((o) => {
      const key = o.orderType?.trim() || 'Unknown';
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return [...counts.entries()].map(([label, count]) => ({ label, count }));
  }, [orders]);

  // ── Render Chart.js charts from real data ──────────────────────────────
  useEffect(() => {
    if (loading) return;
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js';
    script.onload = () => {
      const revenueEl = document.getElementById('revenueChart') as HTMLCanvasElement | null;
      const donutEl = document.getElementById('channelChart') as HTMLCanvasElement | null;
      if (!revenueEl || !donutEl) return;

      const ChartJS = (window as unknown as {
        Chart: { getChart: (el: HTMLCanvasElement) => { destroy: () => void } | undefined } & (new (...args: unknown[]) => unknown);
      }).Chart;
      ChartJS.getChart(revenueEl)?.destroy();
      ChartJS.getChart(donutEl)?.destroy();

      const barCtx = revenueEl.getContext('2d')!;
      const gradient = barCtx.createLinearGradient(0, 0, 0, 256);
      gradient.addColorStop(0, '#4ade80');
      gradient.addColorStop(1, '#00694c');

      new ChartJS(barCtx, {
        type: 'bar',
        data: {
          labels: revenueByDay.map((d) => d.label),
          datasets: [{ data: revenueByDay.map((d) => d.total), backgroundColor: gradient, borderRadius: 6, borderSkipped: false }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (ctx: { parsed: { y: number } }) => fmtVND(ctx.parsed.y) } },
          },
          scales: {
            x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 12 }, color: '#3d4943' } },
            y: {
              grid: { drawOnChartArea: true, color: '#e2e8f0' },
              ticks: { font: { family: 'Inter', size: 11 }, color: '#3d4943', callback: (v: unknown) => Number(v).toLocaleString() },
              beginAtZero: true,
            },
          },
        },
      });

      new ChartJS(donutEl.getContext('2d')!, {
        type: 'doughnut',
        data: {
          labels: channelBreakdown.map((c) => c.label),
          datasets: [
            {
              data: channelBreakdown.map((c) => c.count),
              backgroundColor: channelBreakdown.map((_, i) => CHANNEL_COLORS[i % CHANNEL_COLORS.length]),
              borderWidth: 0,
              hoverOffset: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          cutout: '72%',
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (ctx: { label: string; parsed: number }) => ` ${ctx.label}: ${ctx.parsed} orders` } },
          },
        },
      });
    };
    document.head.appendChild(script);
    return () => {
      try { document.head.removeChild(script); } catch {}
    };
  }, [loading, revenueByDay, channelBreakdown]);

  const totalChannelOrders = channelBreakdown.reduce((s, c) => s + c.count, 0);

  return (
    <>
      <style>{pageCSS}</style>
      <div className="p-8 space-y-6 max-w-7xl font-hanken">
        {loading ? (
          <div className="text-center py-20" style={{ color: '#94a3b8' }}>Loading dashboard…</div>
        ) : (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="rounded-xl p-6 bg-white border flex flex-col justify-between" style={{ borderColor: '#b8e0cc', boxShadow: '0 4px 20px #00694c14' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs mb-1" style={{ color: '#6d7a73' }}>Total Revenue</p>
                    <h3 className="text-xl font-bold">{fmtVND(totalRevenue)}</h3>
                  </div>
                  <span className="material-symbols-outlined p-2 rounded-lg" style={{ color: '#00694c', background: '#e0f5ed' }}>payments</span>
                </div>
              </div>
              <div className="rounded-xl p-6 bg-white border flex flex-col justify-between" style={{ borderColor: '#fcd97a', boxShadow: '0 4px 20px #f59e0b14' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs mb-1" style={{ color: '#6d7a73' }}>Total Orders</p>
                    <h3 className="text-xl font-bold">{orders.length}</h3>
                  </div>
                  <span className="material-symbols-outlined p-2 rounded-lg" style={{ color: '#b47b10', background: '#fff3d6' }}>shopping_cart</span>
                </div>
              </div>
              <div className="rounded-xl p-6 bg-white border flex flex-col justify-between" style={{ borderColor: '#b8e0cc', boxShadow: '0 4px 20px #00694c14' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs mb-1" style={{ color: '#6d7a73' }}>Customers</p>
                    <h3 className="text-xl font-bold">{customerCount}</h3>
                  </div>
                  <span className="material-symbols-outlined p-2 rounded-lg" style={{ color: '#00694c', background: '#e0f5ed' }}>group</span>
                </div>
              </div>
              <div className="rounded-xl p-6 bg-white border flex flex-col justify-between" style={{ borderColor: '#fac057', boxShadow: '0 4px 20px #d9770618' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs mb-1" style={{ color: '#6d7a73' }}>Low Stock Products</p>
                    <h3 className="text-xl font-bold" style={{ color: '#854f0b' }}>{lowStockCount}</h3>
                  </div>
                  <span className="material-symbols-outlined p-2 rounded-lg" style={{ color: '#854f0b', background: '#fff3d6' }}>inventory</span>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 rounded-xl p-6 bg-white border" style={{ borderColor: '#c8e4d8' }}>
                <h4 className="font-bold mb-4">Revenue (Last 7 Days)</h4>
                <div className="relative h-64">
                  <canvas id="revenueChart"></canvas>
                </div>
              </div>
              <div className="rounded-xl p-6 bg-white border flex flex-col" style={{ borderColor: '#c8e4d8' }}>
                <h4 className="font-bold mb-1">Sales Channel</h4>
                <p className="text-xs mb-4" style={{ color: '#6d7a73' }}>By order type</p>
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="relative w-44 h-44">
                    <canvas id="channelChart"></canvas>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span style={{ fontSize: 11, color: '#3d4943', textTransform: 'uppercase' }}>Total</span>
                      <span style={{ fontSize: 24, fontWeight: 700 }}>{totalChannelOrders}</span>
                      <span style={{ fontSize: 11, color: '#3d4943' }}>orders</span>
                    </div>
                  </div>
                  <div className="mt-6 w-full space-y-3">
                    {channelBreakdown.map((c, i) => {
                      const pct = totalChannelOrders ? Math.round((c.count / totalChannelOrders) * 100) : 0;
                      const color = CHANNEL_COLORS[i % CHANNEL_COLORS.length];
                      return (
                        <div key={c.label}>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ background: color }}></div>
                              <span>{c.label}</span>
                            </div>
                            <span className="font-bold">{c.count} <span className="text-xs font-normal" style={{ color: '#6d7a73' }}>({pct}%)</span></span>
                          </div>
                          <div className="w-full rounded-full h-1.5 mt-1" style={{ background: '#f1f5f9' }}>
                            <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: color }}></div>
                          </div>
                        </div>
                      );
                    })}
                    {channelBreakdown.length === 0 && (
                      <p className="text-xs text-center" style={{ color: '#94a3b8' }}>No orders yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tables Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {/* Recent Orders */}
              <div className="rounded-xl bg-white border overflow-hidden" style={{ borderColor: '#c8e4d8' }}>
                <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: '#c8e4d8' }}>
                  <h4 className="font-bold">Recent Orders</h4>
                  <button className="text-sm hover:underline" style={{ color: '#00694c' }} onClick={() => onNav('orders')}>View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead style={{ background: '#f4fbf7' }}>
                      <tr>
                        <th className="px-6 py-3 text-xs uppercase" style={{ color: '#6d7a73' }}>Order</th>
                        <th className="px-6 py-3 text-xs uppercase" style={{ color: '#6d7a73' }}>Customer</th>
                        <th className="px-6 py-3 text-xs uppercase" style={{ color: '#6d7a73' }}>Amount</th>
                        <th className="px-6 py-3 text-xs uppercase" style={{ color: '#6d7a73' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: '#f1f5f9' }}>
                      {filteredOrders.map((o) => {
                        const sc = statusColors(o.orderStatus);
                        return (
                          <tr key={o.orderId}>
                            <td className="px-6 py-4">#{o.orderId}</td>
                            <td className="px-6 py-4">{o.receiverName}</td>
                            <td className="px-6 py-4">{fmtVND(o.totalAmount)}</td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1 items-center">
                                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ background: sc.bg, color: sc.color }}>
                                  {o.orderStatus}
                                </span>
                                <select
                                  value=""
                                  disabled={updatingId === o.orderId}
                                  onChange={(e) => {
                                    if (e.target.value) handleStatusChange(o.orderId, e.target.value);
                                  }}
                                  className="text-[11px] rounded border ml-1"
                                  style={{ borderColor: '#e2e8f0', padding: '1px 3px' }}
                                >
                                  <option value="">Change…</option>
                                  {STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredOrders.length === 0 && (
                        <tr><td colSpan={4} className="px-6 py-8 text-center text-sm" style={{ color: '#94a3b8' }}>No orders match &ldquo;{search}&rdquo;</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Low Stock */}
              <div className="rounded-xl bg-white border overflow-hidden" style={{ borderColor: '#c8e4d8' }}>
                <div className="p-6 border-b flex justify-between items-center" style={{ borderColor: '#c8e4d8' }}>
                  <h4 className="font-bold">Low Stock Alert</h4>
                  <button className="text-sm hover:underline" style={{ color: '#00694c' }} onClick={() => onNav('inventory')}>View Inventory</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead style={{ background: '#f4fbf7' }}>
                      <tr>
                        <th className="px-6 py-3 text-xs uppercase" style={{ color: '#6d7a73' }}>Product</th>
                        <th className="px-6 py-3 text-xs uppercase" style={{ color: '#6d7a73' }}>Category</th>
                        <th className="px-6 py-3 text-xs uppercase text-right" style={{ color: '#6d7a73' }}>Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: '#f1f5f9' }}>
                      {filteredLowStock.map((p) => {
                        const catName = categories.find((c) => c.id === p.categoryId)?.name ?? '';
                        const colorIdx = p.categoryId % CAT_COLORS.length;
                        const stockColor = p.quantity === 0 ? '#dc2626' : p.quantity <= 10 ? '#854f0b' : undefined;
                        return (
                          <tr key={p.id}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="rounded-md overflow-hidden flex-shrink-0" style={{ width: 32, height: 32, background: '#e0f5ed' }}>
                                  <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 3 }} />
                                </div>
                                <span className="font-medium">{p.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: CAT_COLORS[colorIdx], color: CAT_TEXT_COLORS[colorIdx] }}>
                                {catName}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right font-bold" style={{ color: stockColor }}>{p.quantity} units</td>
                          </tr>
                        );
                      })}
                      {filteredLowStock.length === 0 && (
                        <tr><td colSpan={3} className="px-6 py-8 text-center text-sm" style={{ color: '#94a3b8' }}>No low-stock products match your search.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <button className="fab" onClick={() => document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' })}
        title="Back to top">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: 26 }}>arrow_upward</span>
      </button>
    </>
  );
}
