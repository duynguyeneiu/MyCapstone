import api from "../lib/api";
import { Product } from "../lib/data";

interface ApiProduct {
  productId: number;
  productName: string;
  description: string | null;
  salePrice: number;
  quantityInStock: number;
  image: string | null;
  categoryId: number;
  category?: { categoryName: string } | null;
  barcode: string | null;
}

export interface ApiProductRaw {
  productId: number;
  productCode: string;
  barcode: string | null;
  productName: string;
  unit: string;
  importPrice: number;
  salePrice: number;
  quantityInStock: number;
  image: string | null;
  description: string | null;
  categoryId: number;
  status: string;
  createdAt?: string;
  updatedAt?: string | null;
}

const mapProduct = (p: ApiProduct): Product => ({
  id: p.productId,
  name: p.productName,
  description: p.description ?? "",
  price: p.salePrice,
  quantity: p.quantityInStock,
  image: p.image ? `/image/${p.image}` : "",
  categoryId: p.categoryId,
  category: p.category?.categoryName,
  brandId: 0,
  barcode: p.barcode ?? "",
});

export const productService = {
  async getAll(): Promise<Product[]> {
    const res = await api.get<ApiProduct[]>("/products");
    return res.data.map(mapProduct);
  },

  async getById(id: number): Promise<Product> {
    const res = await api.get<ApiProduct>(`/products/${id}`);
    return mapProduct(res.data);
  },

  // Returns the raw backend shape (incl. productCode/unit/importPrice/status)
  // — needed so edit forms can round-trip a full entity to the PUT endpoint,
  // which replaces the whole row rather than patching individual fields.
  async getRawById(id: number): Promise<ApiProductRaw> {
    const res = await api.get<ApiProductRaw>(`/products/${id}`);
    return res.data;
  },

  async create(data: ApiProductRaw) {
    const res = await api.post("/products", data);
    return res.data;
  },

  async update(id: number, data: ApiProductRaw) {
    const res = await api.put(`/products/${id}`, data);
    return res.data;
  },

  async delete(id: number) {
    await api.delete(`/products/${id}`);
  },
};
