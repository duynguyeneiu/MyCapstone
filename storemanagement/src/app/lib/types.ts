export type Category =
  | 'beverages'
  | 'snacks'
  | 'food'
  | 'personal-care'
  | 'household';

export type Subcategory =
  | 'water-soft-drinks'
  | 'tea-coffee'
  | 'chips-snacks'
  | 'sweets'
  | 'instant-foods'
  | 'ready-canned'
  | 'oral-hair-care'
  | 'body-skin-care'
  | 'laundry-cleaning'
  | 'paper-storage';

export type OrderStatus = "processing" | "shipping" | "delivered" | "cancelled";
export type PaymentMethod = "card" | "momo" | "bank" | "cod";
export type ProfileTab = "info" | "address" | "security" | "notif";
export type ReviewTab = "write" | "mine" | "pending";
export type SortMode = "default" | "price-asc" | "price-desc" | "rating";

export interface Product {
  id: number;
  name: string;
  category: Category;
  subcategory: Subcategory;
  price: number;
  original: number | null;
  rating: number;
  reviews: number;
  emoji: string;
  image: string;
  desc: string;
}

export interface CartItem { id: number; qty: number; }

export interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  payment: string;
  items: { pid: number; qty: number }[];
}

export interface Review {
  pid: number;
  rating: number;
  title: string;
  body: string;
  pros: string;
  cons: string;
  date: string;
  helpful: number;
}
