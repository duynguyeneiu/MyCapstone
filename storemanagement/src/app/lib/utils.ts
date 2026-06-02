import { CartItem, Product } from './types';
import { PRODUCTS } from './data';

export const fmt = (n: number) => `$${n.toFixed(2)}`;
export const disc = (p: Product) => p.original ? Math.round((1 - p.price / p.original) * 100) : 0;
export const subtotal = (cart: CartItem[]) =>
  cart.reduce((s, i) => s + (PRODUCTS.find(p => p.id === i.id)?.price ?? 0) * i.qty, 0);
