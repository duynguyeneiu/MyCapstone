import OrdersContent from '../components/orders/OrdersContent';
import CategoryBar from '../components/CategoryBar';

export default function OrdersPage() {
  return (
    <div className="aqua-page">
      <CategoryBar />
      <OrdersContent />
    </div>
  );
}
