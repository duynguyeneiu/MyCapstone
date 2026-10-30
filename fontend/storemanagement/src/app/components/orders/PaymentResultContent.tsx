'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fmt } from '@/src/lib/utils';
import { paymentService, ApiPayment } from '@/src/services/paymentService';
import BtnTeal from '../ui/BtnTeal';

interface PaymentResultContentProps {
  txnRef: string;
}

const MAX_TRIES = 10;     // ~20 seconds
const INTERVAL_MS = 2000;

type ViewInfo = { icon: string; color: string; title: string; text: string };

export default function PaymentResultContent({ txnRef }: PaymentResultContentProps) {
  const router = useRouter();
  const [payment, setPayment] = useState<ApiPayment | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Poll: the IPN may arrive AFTER the browser has been redirected back.
  // Status is read from the DB only — never trust query params from the URL.
  useEffect(() => {
    if (!txnRef) {
      setError('Missing transaction reference.');
      return;
    }

    let tries = 0;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      try {
        const p = await paymentService.getByTxnRef(txnRef);
        if (cancelled) return;
        setPayment(p);
        tries++;
        if (p.status === 'Pending' && tries < MAX_TRIES) {
          timer = setTimeout(poll, INTERVAL_MS);
        }
      } catch {
        if (!cancelled) setError('Could not load payment status.');
      }
    };

    poll();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [txnRef]);

  const status = error ? 'Error' : payment?.status ?? 'Loading';

  const views: Record<string, ViewInfo> = {
    Loading:   { icon: 'hourglass_top', color: '#64748b',     title: 'Checking payment...',  text: 'Please wait a moment.' },
    Pending:   { icon: 'schedule',      color: '#d97706',     title: 'Payment Processing',   text: 'We are still confirming your payment. Please check My Orders in a few minutes.' },
    Completed: { icon: 'check_circle',  color: 'var(--teal)', title: 'Payment Successful!',  text: 'Your payment has been confirmed. Thank you for your purchase.' },
    Failed:    { icon: 'cancel',        color: '#b91c1c',     title: 'Payment Failed',
                 // Cancel code: VNPay = 24, MoMo = 1006
                 text: payment?.responseCode === '24' || payment?.responseCode === '1006'
                   ? 'You cancelled the payment.'
                   : 'The payment could not be completed.' },
    Cancelled: { icon: 'cancel',        color: '#b91c1c',     title: 'Payment Cancelled',    text: 'This payment was cancelled.' },
    Error:     { icon: 'error',         color: '#b91c1c',     title: 'Something went wrong', text: error ?? '' },
  };
  const view = views[status] ?? { icon: 'help', color: '#64748b', title: status, text: '' };

  return (
    <div style={{ maxWidth: 520, margin: '0 auto', padding: '5rem 1.5rem', textAlign: 'center' }}>
      <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'var(--teal-xs)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
        <span
          className="material-symbols-outlined"
          style={{ fontSize: '52px', color: view.color, fontVariationSettings: "'FILL' 1" }}
        >
          {view.icon}
        </span>
      </div>
      <h1 className="serif" style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
        {view.title}
      </h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>{view.text}</p>

      {payment && (
        <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '1.25rem 1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,.06)', textAlign: 'left', marginBottom: '2rem', fontSize: '.875rem' }}>
          <Row label="Transaction" value={payment.txnRef} />
          <Row label="Amount" value={fmt(payment.amount)} />
          <Row label="Method" value={payment.paymentMethod} />
          {payment.transactionCode && <Row label={`${payment.paymentMethod} code`} value={payment.transactionCode} />}
          {payment.bankCode && <Row label={payment.paymentMethod === 'MoMo' ? 'Pay type' : 'Bank'} value={payment.bankCode} />}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <BtnTeal onClick={() => router.push('/')} style={{ padding: '0.75rem 2.5rem' }}>Back to Home</BtnTeal>
        {payment && (
          <BtnTeal
            onClick={() => router.push(`/orders/${payment.orderId}`)}
            style={{ padding: '0.75rem 2.5rem', background: 'var(--teal-dk)' }}
          >
            View Order
          </BtnTeal>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: '0.4rem' }}>
      <span style={{ color: '#64748b' }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}
