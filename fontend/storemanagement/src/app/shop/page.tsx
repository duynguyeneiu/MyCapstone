import ShopContent from '../components/shop/ShopContent';

interface ShopPageProps {
  searchParams: Promise<{ category?: string; sub?: string }>;
}

const isNumericId = (v?: string): v is string => !!v && /^\d+$/.test(v);

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const initCategory    = isNumericId(params.category) ? params.category : 'all';
  const initSubcategory = isNumericId(params.sub) ? params.sub : 'all';

  return (
    <div className="aqua-page">
      <ShopContent initCategory={initCategory} initSubcategory={initSubcategory} />
    </div>
  );
}
