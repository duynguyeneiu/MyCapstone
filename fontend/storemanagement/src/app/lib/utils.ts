import { CartItem, Product } from "@/src/lib/data";

export const fmt = (n: number) => n.toLocaleString("vi-VN") + "₫";
export const disc = (p: Product) =>
  p.price ? Math.round((1 - p.price / p.price) * 100) : 0;
// export const subtotal = (cart: CartItem[]) =>
//   cart.reduce((s, i) => s + (PRODUCTS.find(p => p.id === i.id)?.price ?? 0) * i.qty, 0);
