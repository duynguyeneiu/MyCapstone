export type PaymentMethod = "vnpay" | "cod";
export type ProfileTab = "info" | "address" | "security" | "notif";
export type ReviewTab = "write" | "mine" | "pending";

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
