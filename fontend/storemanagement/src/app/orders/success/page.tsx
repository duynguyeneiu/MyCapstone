import SuccessContent from '../../components/orders/SuccessContent';

interface SuccessPageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const orderId = params.id ?? '#AM00000';
  return (
    <div className="aqua-page" style={{ paddingTop: '2rem' }}>
      <SuccessContent orderId={orderId} />
    </div>
  );
}
