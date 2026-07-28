import ProductDetail from '../../components/product/ProductDetail';
import CategoryBar from '../../components/CategoryBar';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const productId = parseInt(id, 10);
  return (
    <div className="aqua-page">
      <CategoryBar />
      <ProductDetail productId={productId} />
    </div>
  );
}
