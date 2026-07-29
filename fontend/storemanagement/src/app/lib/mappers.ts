import { ApiProduct, Product } from './types';

// Backend has no rating/reviews/original-price/emoji yet — default them out
// until a review/promotion service exists. ProductCard hides the rating row
// when rating is 0.
export function toProduct(p: ApiProduct, categoryName?: string): Product {
  return {
    id: p.productId,
    name: p.productName,
    category: categoryName ?? 'Uncategorized',
    categoryId: p.categoryId,
    price: p.salePrice,
    original: null,
    rating: 0,
    reviews: 0,
    emoji: '📦',
    image: p.image ?? '',
    desc: p.description ?? '',
  };
}
