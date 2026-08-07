import ShopContent from '../components/shop/ShopContent';

interface ShopPageProps {
  searchParams: Promise<{ category?: string; sub?: string }>;
}

// Categories are dynamic DB rows now (not a fixed slug set) — the URL just
// carries their numeric id, so only validate that it looks like one.
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
