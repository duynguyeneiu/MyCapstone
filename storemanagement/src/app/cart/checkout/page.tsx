import CheckoutContent from '../../components/cart/CheckoutContent';
import CategoryBar from '../../components/CategoryBar';

export default function CheckoutPage() {
  return (
    <div className="aqua-page">
      <CategoryBar />
      <CheckoutContent />
    </div>
  );
}
