import { Product } from "./data";

export const fmt = (n: number) => n.toLocaleString("vi-VN") + " VND";

// Backend có thể trả ảnh dưới nhiều dạng khác nhau:
// http://192.168.1.10:5001/images/sweet1.png | sweet1.png | images/sweet1.png | /image/sweet1.png ...
// Hàm này chuẩn hoá về: `${baseUrl}/images/<fileName>`
export const getImageUrl = (image: string | null | undefined): string => {
  if (!image) return "";

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

  if (image.startsWith("http://") || image.startsWith("https://")) {
    try {
      const url = new URL(image);
      const fileName = url.pathname.replace(/\\/g, "/").split("/").pop();
      return fileName ? `${baseUrl}/images/${fileName}` : "";
    } catch {
      return "";
    }
  }

  const fileName = image.replace(/\\/g, "/").split("/").pop();
  return fileName ? `${baseUrl}/images/${fileName}` : "";
};

export const disc = (p: Product) =>
  p.price ? Math.round((1 - p.price / p.price) * 100) : 0;

export const initials = (name: string | null | undefined) =>
  (name ?? "").trim().split(/\s+/).filter(Boolean).map((w) => w[0]).slice(-2).join("").toUpperCase();

export function getPageNums(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3)
    return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}
