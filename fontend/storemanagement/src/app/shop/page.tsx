import ShopContent from '../components/shop/ShopContent';
import { Category, Subcategory } from '../lib/types';

interface ShopPageProps {
  searchParams: Promise<{ category?: string; sub?: string }>;
}

const VALID_CATS: Category[]    = ['beverages', 'snacks', 'food', 'personal-care', 'household'];
const VALID_SUBS: Subcategory[] = [
  'water-soft-drinks', 'tea-coffee',
  'chips-snacks', 'sweets',
  'instant-foods', 'ready-canned',
  'oral-hair-care', 'body-skin-care',
  'laundry-cleaning', 'paper-storage',
];

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const cat = params.category as Category | undefined;
  const sub = params.sub as Subcategory | undefined;
  const initCategory    = cat && VALID_CATS.includes(cat) ? cat : 'all';
  const initSubcategory = sub && VALID_SUBS.includes(sub) ? sub : 'all';

  return (
    <div className="aqua-page">
      <ShopContent initCategory={initCategory} initSubcategory={initSubcategory} />
    </div>
  );
}
