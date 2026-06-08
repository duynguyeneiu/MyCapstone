'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Order, OrderStatus } from '../../lib/types';
import { PRODUCTS } from '../../lib/data';
import { fmt } from '../../lib/utils';
import { useOrders } from '../../context/OrderContext';
import BtnTeal from '../ui/BtnTeal';
import BtnOutline from '../ui/BtnOutline';

const statusCfg: Record<OrderStatus, { label: string; bg: string; color: string; icon: string }> = {
  delivered:  { label: 'Delivered',  bg: '#dcfce7', color: '#166534', icon: 'check_circle' },
  processing: { label: 'Processing', bg: '#fef9c3', color: '#854d0e', icon: 'schedule' },
  shipping:   { label: 'Shipping',   bg: '#dbeafe', color: '#1e40af', icon: 'local_shipping' },
  cancelled:  { label: 'Cancelled',  bg: '#fee2e2', color: '#991b1b', icon: 'cancel' },
};

const progressPct = (s: OrderStatus) => s === 'processing' ? 25 : s === 'shipping' ? 62 : s === 'delivered' ? 100 : 0;

export default function OrdersContent() {
  const router = useRouter();
  const { orders } = useOrders();
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  const filtered = orders.filter(o =>
    (filter === 'all' || o.status === filter) &&
    (!search || o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.items.some(i => PRODUCTS.find(p => p.id === i.pid)?.name.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Detail Modal */}
      {detailOrder && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setDetailOrder(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '1.5rem', width: '90%', maxWidth: 520, overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
              <div>
                <h3 className="serif" style={{ fontWeight: 700, fontSize: '1.15rem' }}>{detailOrder.id}</h3>
                <p style={{ fontSize: '.8rem', color: '#64748b' }}>{detailOrder.date} · {detailOrder.payment}</p>
              </div>
              <button onClick={() => setDetailOrder(null)} style={{ width: 32, height: 32, borderRadius: '50%', background: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#64748b' }}>close</span>
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p style={{ fontWeight: 600, fontSize: '.9rem', marginBottom: '1rem' }}>Order Progress</p>
              {([['Order Placed', true], ['Payment Confirmed', detailOrder.status !== 'cancelled'], ['Packed & Ready', ['shipping', 'delivered'].includes(detailOrder.status)], ['Out for Delivery', detailOrder.status === 'delivered'], ['Delivered', detailOrder.status === 'delivered']] as [string, boolean][]).map(([l, done]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: done ? 'var(--teal)' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {done
                      ? <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#fff' }}>check</span>
                      : <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#cbd5e1', display: 'block' }} />}
                  </div>
                  <span style={{ fontSize: '.9rem', fontWeight: done ? 500 : 400, color: done ? '#1e293b' : '#94a3b8' }}>{l}</span>
                </div>
              ))}

              <p style={{ fontWeight: 600, fontSize: '.9rem', margin: '1.25rem 0 .75rem' }}>Items Ordered</p>
              {detailOrder.items.map(item => {
                const p = PRODUCTS.find(x => x.id === item.pid)!;
                return (
                  <div key={item.pid} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--teal-xs)', borderRadius: '0.75rem', padding: '0.75rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{p.emoji}</span>
                    <span style={{ flex: 1, fontSize: '.875rem', fontWeight: 500 }}>{p.name} ×{item.qty}</span>
                    <span style={{ fontWeight: 700, fontSize: '.875rem', color: 'var(--teal)' }}>{fmt(p.price * item.qty)}</span>
                  </div>
                );
              })}

              {(() => {
                const sub = detailOrder.items.reduce((s, i) => s + PRODUCTS.find(p => p.id === i.pid)!.price * i.qty, 0);
                return (
                  <div style={{ background: 'var(--teal-xs)', borderRadius: '0.75rem', padding: '1rem', margin: '1rem 0' }}>
                    {[['Subtotal', fmt(sub)], ['Shipping', 'FREE'], ['Tax (10%)', fmt(sub * .1)], ['Total', fmt(sub * 1.1)]].map(([l, v], i) => (
                      <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontWeight: i === 3 ? 700 : 400, fontSize: i === 3 ? '1rem' : '.875rem', marginBottom: i < 3 ? '0.3rem' : 0 }}>
                        <span style={{ color: i === 3 ? '#1e293b' : '#64748b' }}>{l}</span>
                        <span style={{ color: i === 3 ? 'var(--teal)' : l === 'Shipping' ? '#16a34a' : undefined }}>{v}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {detailOrder.status === 'delivered' && (
                  <BtnTeal onClick={() => { setDetailOrder(null); router.push('/reviews'); }} style={{ flex: 1, padding: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>star</span>Write Review
                  </BtnTeal>
                )}
                {detailOrder.status === 'shipping' && (
                  <BtnTeal style={{ flex: 1, padding: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>map</span>Track Shipment
                  </BtnTeal>
                )}
                <BtnOutline onClick={() => setDetailOrder(null)} style={{ flex: 1, padding: '0.6rem' } as React.CSSProperties}>Close</BtnOutline>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 className="serif" style={{ fontSize: '2rem', fontWeight: 700 }}>Order History</h1>
          <p style={{ color: '#64748b', fontSize: '.875rem', marginTop: 4 }}>Track and manage all your past orders</p>
        </div>
        <BtnOutline onClick={() => router.push('/shop')}>+ New Order</BtnOutline>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', background: '#fff', borderRadius: '1rem', padding: '0.5rem', boxShadow: '0 2px 8px rgba(0,0,0,.04)', width: 'fit-content', marginBottom: '1.25rem' }}>
        {(['all', 'processing', 'shipping', 'delivered', 'cancelled'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: '.4rem 1rem', borderRadius: 9999, border: 'none', background: filter === s ? 'var(--teal)' : 'transparent', color: filter === s ? '#fff' : '#64748b', fontWeight: 500, fontSize: '.85rem', cursor: 'pointer', transition: '.2s' }}>
            {s === 'all' ? 'All Orders' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 480, marginBottom: '1.5rem' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by order ID or product…" />
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: '#94a3b8' }}>inventory_2</span>
          <p className="serif" style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '1rem' }}>No orders found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(o => {
            const sc = statusCfg[o.status];
            const total = o.items.reduce((s, i) => s + PRODUCTS.find(p => p.id === i.pid)!.price * i.qty, 0) * 1.1;
            const fp = PRODUCTS.find(p => p.id === o.items[0].pid)!;
            const extra = o.items.length - 1;
            const pct = progressPct(o.status);
            return (
              <div key={o.id} style={{ background: '#fff', borderRadius: '1.25rem', boxShadow: '0 2px 10px rgba(0,0,0,.05)', overflow: 'hidden', transition: '.2s' }}>
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span className="serif" style={{ fontWeight: 700, fontSize: '1rem' }}>{o.id}</span>
                        <span style={{ background: sc.bg, color: sc.color, borderRadius: 9999, padding: '.15rem .65rem', fontSize: '.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '13px', color: 'inherit' }}>{sc.icon}</span>
                          {sc.label}
                        </span>
                      </div>
                      <p style={{ fontSize: '.75rem', color: '#94a3b8', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>calendar_today</span>{o.date}
                        <span style={{ margin: '0 1px' }}>·</span>
                        <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>credit_card</span>{o.payment}
                      </p>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--teal)' }}>{fmt(total)}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex' }}>
                      {o.items.slice(0, 3).map(i => {
                        const p = PRODUCTS.find(x => x.id === i.pid)!;
                        return (
                          <div key={i.pid} style={{ width: 40, height: 40, borderRadius: '0.6rem', background: 'var(--teal-xs)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', border: '2px solid #fff', marginLeft: -4 }}>
                            {p.emoji}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ marginLeft: 4 }}>
                      <p style={{ fontSize: '.875rem', fontWeight: 500 }}>
                        {fp.name}{extra > 0 && <span style={{ color: '#94a3b8', fontWeight: 400 }}> +{extra} more</span>}
                      </p>
                      <p style={{ fontSize: '.75rem', color: '#94a3b8' }}>{o.items.reduce((s, i) => s + i.qty, 0)} item{o.items.reduce((s, i) => s + i.qty, 0) !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  {(o.status === 'shipping' || o.status === 'processing') && (
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.7rem', color: '#94a3b8', marginBottom: 4 }}>
                        {['Ordered', 'Packed', 'In Transit', 'Delivered'].map(l => <span key={l}>{l}</span>)}
                      </div>
                      <div style={{ width: '100%', height: 6, background: '#f1f5f9', borderRadius: 3 }}>
                        <div style={{ height: 6, background: 'var(--teal)', borderRadius: 3, width: `${pct}%`, transition: '.5s' }} />
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <BtnTeal onClick={() => setDetailOrder(o)} style={{ fontSize: '.8rem', padding: '0.45rem 1rem' }}>View Details</BtnTeal>
                    {o.status === 'delivered' && (
                      <BtnOutline onClick={() => router.push('/reviews')} style={{ fontSize: '.8rem', padding: '0.4rem .9rem', display: 'inline-flex', alignItems: 'center', gap: 4 } as React.CSSProperties}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>star</span>Write Review
                      </BtnOutline>
                    )}
                    {o.status === 'shipping' && (
                      <BtnOutline style={{ fontSize: '.8rem', padding: '0.4rem .9rem', display: 'inline-flex', alignItems: 'center', gap: 4 } as React.CSSProperties}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>map</span>Track Order
                      </BtnOutline>
                    )}
                    {o.status === 'processing' && (
                      <BtnOutline style={{ fontSize: '.8rem', padding: '0.4rem .9rem' } as React.CSSProperties}>Cancel</BtnOutline>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
