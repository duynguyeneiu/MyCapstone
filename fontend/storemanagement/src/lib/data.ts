export interface Category {
  id: number;
  name: string;
  description: string;
  parentCategoryId: number | null;
  status: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
  categoryId: number;
  category?: string;
  brandId: number;
  brand?: string;
  barcode: string;
  status: string;
  rating?: number;
  reviews?: number;
}

export type PaymentMethod = "vnpay" | "momo" | "cod";

// UI id → value stored in backend (ORDER.PaymentMethod / PAYMENT.PaymentMethod)
export const PAYMENT_METHOD_API: Record<PaymentMethod, string> = {
  vnpay: "VNPay",
  momo: "MoMo",
  cod: "COD",
};
export type ProfileTab = "info" | "address" | "security" | "notif";
export type ReviewTab = "write" | "mine" | "pending";

export const STAR_LABELS = ["", "Terrible", "Bad", "Okay", "Good", "Excellent"];
