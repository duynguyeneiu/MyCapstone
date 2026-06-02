export type Category = "appliances" | "food" | "beauty";
export type OrderStatus = "processing" | "shipping" | "delivered" | "cancelled";
export type PaymentMethod = "card" | "momo" | "bank" | "cod";
export type ProfileTab = "info" | "address" | "security" | "notif";
export type ReviewTab = "write" | "mine" | "pending";
export type SortMode = "default" | "price-asc" | "price-desc" | "rating";

export interface Product {
  id: number;
  name: string;
  category: Category;
  price: number;
  original: number | null;
  rating: number;
  reviews: number;
  emoji: string;
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
