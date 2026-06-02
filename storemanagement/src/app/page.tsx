import HomeContent from './components/home/HomeContent';
import CategoryBar from './components/CategoryBar';

export default function HomePage() {
  return (
    <div className="aqua-page">
      <CategoryBar />
      <HomeContent />
    </div>
  );
}
