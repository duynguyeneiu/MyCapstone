'use client';

import Icon from '../ui/Icon';
import { C } from '../../_lib/types';
import { fmt } from '../../_lib/utils';
import { TransactionRecord } from './ReceiptModal';

interface POSHistoryPageProps {
  history: TransactionRecord[];
  onBack: () => void;
  onViewReceipt: (tx: TransactionRecord) => void;
}

const paymentColor: Record<string, { bg: string; color: string }> = {
  Cash: { bg: '#d1fae5', color: '#065f46' },
  Card: { bg: '#dbeafe', color: '#1e40af' },
  QR:   { bg: '#ede9fe', color: '#6d28d9' },
};

export default function POSHistoryPage({ history, onBack, onViewReceipt }: POSHistoryPageProps) {
  const totalRevenue = history.reduce((s, t) => s + t.total, 0);
  const totalItems   = history.reduce((s, t) => s + t.items.reduce((a, i) => a + i.qty, 0), 0);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f2f4f6' }}>

      {/* Topbar */}
      <div style={{ height: 56, background: '#fff', borderBottom: '1px solid #e0e3e5', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, flexShrink: 0 }}>
        <button onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, fontSize: 13, fontWeight: 600, padding: '6px 10px', borderRadius: 8 }}
          onMouseEnter={e => e.currentTarget.style.background = '#f2f4f6'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <Icon name="arrow_back" size={18} /> Back to POS
        </button>
        <div style={{ width: 1, height: 20, background: '#e0e3e5' }} />
        <div style={{ width: 32, height: 32, background: C.primary, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="history" size={18} style={{ color: '#fff' }} />
        </div>
        <span style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 17, fontWeight: 700, color: C.textMain, flex: 1 }}>
          POS Order History
        </span>
        <span style={{ fontSize: 12, color: C.textFaint }}>{history.length} transaction{history.length !== 1 ? 's' : ''} today</span>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
          {[
            { label: 'Total Transactions', value: String(history.length), icon: 'receipt_long', color: C.primary },
            { label: 'Total Revenue',       value: fmt(totalRevenue),     icon: 'payments',     color: '#059669' },
            { label: 'Total Items Sold',    value: String(totalItems),    icon: 'shopping_bag', color: '#1d6fb8' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '16px 18px', border: '1px solid #e0e3e5', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name={s.icon} size={22} style={{ color: s.color }} />
              </div>
              <div>
                <p style={{ fontSize: 11, color: C.textFaint, marginBottom: 2 }}>{s.label}</p>
                <p style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 20, fontWeight: 700, color: C.textMain }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Transactions list */}
        {history.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 12, padding: '60px 24px', textAlign: 'center', border: '1px solid #e0e3e5' }}>
            <Icon name="receipt_long" size={48} style={{ color: '#bccac1' }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: C.textMuted, marginTop: 12 }}>No transactions yet</p>
            <p style={{ fontSize: 13, color: C.textFaint, marginTop: 4 }}>Completed POS transactions will appear here</p>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e0e3e5', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f4fbf7' }}>
                  {['Invoice', 'Time', 'Items', 'Payment', 'Total', ''].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: C.textFaint, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...history].reverse().map(tx => {
                  const pc = paymentColor[tx.paymentMethod] ?? { bg: '#f3f4f6', color: '#6b7280' };
                  const itemCount = tx.items.reduce((s, i) => s + i.qty, 0);
                  return (
                    <tr key={tx.invoiceNo} style={{ borderBottom: '1px solid #f2f4f6' }}
                      onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#f9fafb'}
                      onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = ''}
                    >
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: C.primary }}>
                        #{String(tx.invoiceNo).padStart(4, '0')}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: C.textFaint }}>{tx.time}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>{itemCount} item{itemCount !== 1 ? 's' : ''}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: pc.bg, color: pc.color, borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
                          {tx.paymentMethod}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 700, color: C.textMain }}>{fmt(tx.total)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <button onClick={() => onViewReceipt(tx)}
                          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, border: `1.5px solid ${C.outline}`, background: '#fff', color: C.primary, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#f0faf5'; e.currentTarget.style.borderColor = C.primary; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = C.outline; }}
                        >
                          <Icon name="receipt" size={14} /> Receipt
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
