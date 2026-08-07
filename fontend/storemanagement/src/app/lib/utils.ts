import { Product } from "@/src/lib/data";

export const fmt = (n: number) => n.toLocaleString("vi-VN") + "₫";
export const disc = (p: Product) =>
  p.price ? Math.round((1 - p.price / p.price) * 100) : 0;

export function getPageNums(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3)
    return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}
// export const subtotal = (cart: CartItem[]) =>
//   cart.reduce((s, i) => s + (PRODUCTS.find(p => p.id === i.id)?.price ?? 0) * i.qty, 0);
