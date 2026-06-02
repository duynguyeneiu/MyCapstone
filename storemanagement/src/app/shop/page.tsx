import ShopContent from '../components/shop/ShopContent';
import CategoryBar from '../components/CategoryBar';
import { Category } from '../lib/types';

interface ShopPageProps {
  searchParams: Promise<{ category?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const cat = params.category as Category | undefined;
  const validCats: Category[] = ['appliances', 'food', 'beauty'];
  const initCategory = cat && validCats.includes(cat) ? cat : 'all';

  return (
    <div className="aqua-page">
      <CategoryBar />
      <ShopContent initCategory={initCategory} />
    </div>
  );
}
