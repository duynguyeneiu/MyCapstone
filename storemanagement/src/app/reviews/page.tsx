import ReviewsContent from '../components/reviews/ReviewsContent';
import CategoryBar from '../components/CategoryBar';

export default function ReviewsPage() {
  return (
    <div className="aqua-page">
      <CategoryBar />
      <ReviewsContent />
    </div>
  );
}
