'use client';

import { C } from '../../_lib/types';
import { fmt } from '../../_lib/utils';

interface CartItem { id: number; name: string; price: number; qty: number; }

export interface TransactionRecord {
  invoiceNo: number;
  date: string;
  time: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
  paymentMethod: string;
}

interface ReceiptModalProps {
  tx: TransactionRecord;
  onClose: () => void;
  onNewInvoice?: () => void;
}

function Divider({ dashed = false }: { dashed?: boolean }) {
  return (
    <div style={{
      borderTop: dashed ? '1px dashed #ccc' : '1px solid #e0e3e5',
      margin: '10px 0',
    }} />
  );
}

function Row({ label, value, bold = false, color }: { label: string; value: string; bold?: boolean; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
      <span style={{ color: bold ? '#191c1e' : '#6d7a73', fontWeight: bold ? 700 : 400 }}>{label}</span>
      <span style={{ fontWeight: bold ? 700 : 500, color: color ?? (bold ? '#191c1e' : '#191c1e') }}>{value}</span>
    </div>
  );
}

export default function ReceiptModal({ tx, onClose, onNewInvoice }: ReceiptModalProps) {
  const handlePrint = () => window.print();

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 380, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 24px 60px rgba(0,0,0,.25)', animation: 'pop .2s ease' }}>

        {/* Header */}
        <div style={{ background: C.primary, padding: '20px 24px', textAlign: 'center', borderRadius: '16px 16px 0 0' }}>
          <p style={{ fontFamily: "'Hanken Grotesk',sans-serif", fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>
            🛍 Happy Market
          </p>
          <p style={{ fontSize: 11, color: '#b8e0cc', marginTop: 2 }}>Official Receipt</p>
        </div>

        {/* Receipt body */}
        <div style={{ padding: '20px 24px', fontFamily: "'Inter', sans-serif" }}>

          {/* Invoice info */}
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <p style={{ fontSize: 18, fontWeight: 700, color: C.primary }}>
              Invoice #{String(tx.invoiceNo).padStart(4, '0')}
            </p>
            <p style={{ fontSize: 12, color: '#6d7a73', marginTop: 2 }}>{tx.date} • {tx.time}</p>
            <p style={{ fontSize: 11, color: '#6d7a73' }}>Cashier: Minh Tran</p>
          </div>

          <Divider dashed />

          {/* Items */}
          <div style={{ marginBottom: 4 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#6d7a73', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Items</p>
            {tx.items.map((item) => (
              <div key={item.id} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ fontWeight: 500, flex: 1, paddingRight: 8, wordBreak: 'break-word' }}>{item.name}</span>
                  <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{fmt(item.price * item.qty)}</span>
                </div>
                <p style={{ fontSize: 11, color: '#6d7a73', marginTop: 1 }}>
                  {item.qty} × {fmt(item.price)}
                </p>
              </div>
            ))}
          </div>

          <Divider dashed />

          {/* Totals */}
          <Row label="Subtotal" value={fmt(tx.subtotal)} />
          {tx.discount > 0 && <Row label="Discount" value={`-${fmt(tx.discount)}`} color="#059669" />}
          <Row label="VAT (10%)" value={fmt(tx.vat)} />
          <Divider />
          <Row label="TOTAL" value={fmt(tx.total)} bold color={C.primary} />

          <Divider dashed />

          {/* Payment */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: '#6d7a73' }}>Payment method</span>
            <span style={{ fontSize: 13, fontWeight: 700, background: C.primaryBg, color: C.primary, borderRadius: 99, padding: '3px 10px' }}>
              {tx.paymentMethod}
            </span>
          </div>

          {/* Thank you */}
          <div style={{ textAlign: 'center', padding: '12px 0 4px', borderTop: '1px dashed #ccc' }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#191c1e' }}>Thank you for shopping!</p>
            <p style={{ fontSize: 11, color: '#6d7a73', marginTop: 2 }}>Happy Market – Fresh Finds Delivered Daily</p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding: '12px 24px 20px', display: 'flex', gap: 10, borderTop: '1px solid #f1f5f9' }}>
          {onNewInvoice && (
            <button onClick={onNewInvoice}
              style={{ flex: 1, padding: '10px', border: `1.5px solid ${C.outline}`, borderRadius: 10, background: '#fff', color: C.textMuted, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              New Invoice
            </button>
          )}
          <button onClick={handlePrint}
            style={{ flex: 1, padding: '10px', background: `linear-gradient(135deg,${C.primary},#00a86b)`, border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            🖨 Print Receipt
          </button>
          {!onNewInvoice && (
            <button onClick={onClose}
              style={{ flex: 1, padding: '10px', border: `1.5px solid ${C.outline}`, borderRadius: 10, background: '#fff', color: C.textMuted, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
