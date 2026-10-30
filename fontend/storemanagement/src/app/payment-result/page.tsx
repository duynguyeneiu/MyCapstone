import PaymentResultContent from '../components/orders/PaymentResultContent';

interface PaymentResultPageProps {
  searchParams: Promise<{ txnRef?: string }>;
}

export default async function PaymentResultPage({ searchParams }: PaymentResultPageProps) {
  const params = await searchParams;
  return (
    <div className="aqua-page" style={{ paddingTop: '2rem' }}>
      <PaymentResultContent txnRef={params.txnRef ?? ''} />
    </div>
  );
}
