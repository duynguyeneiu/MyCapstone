import Image from "next/image";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="product-card group">
      <Link href={`/product/${product.id}`} className="relative block h-52 overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </Link>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-gray-500 text-sm line-clamp-2 mb-3 min-h-[2.5rem]">{product.description}</p>
        <div className="flex items-center justify-between gap-2">
          <span className="text-primary font-bold text-lg">${product.price.toFixed(2)}</span>
          <Link href={`/product/${product.id}`} className="btn-primary text-sm py-1.5 px-4">View Detail</Link>
        </div>
      </div>
    </div>
  );
}
