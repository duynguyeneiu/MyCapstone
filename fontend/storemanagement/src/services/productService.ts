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
  categoryName?: string;
  barcode: string | null;
  status: string;
}

interface PagedResult<T> {
  items: T[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
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
  categoryName?: string;
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
  category: p.categoryName,
  brandId: 0,
  barcode: p.barcode ?? "",
  status: p.status,
});

export interface PagedProducts {
  items: Product[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const productService = {
  async getAll(): Promise<Product[]> {
    const res = await api.get<PagedResult<ApiProduct>>("/products", {
      params: { page: 1, pageSize: 1000 },
    });
    return res.data.items.map(mapProduct);
  },

  // Server-side pagination/search — use this over getAll() when the list
  // can grow large and you don't need every row loaded client-side at once.
  async getPaged(params: { page?: number; pageSize?: number; keyword?: string } = {}): Promise<PagedProducts> {
    const res = await api.get<PagedResult<ApiProduct>>("/products", {
      params: { page: 1, pageSize: 10, ...params },
    });
    return { ...res.data, items: res.data.items.map(mapProduct) };
  },

  // Server-side pagination scoped to one category — backend has no combined
  // category+keyword filter, so this is keyword-less by design.
  async getByCategory(categoryId: number, params: { page?: number; pageSize?: number } = {}): Promise<PagedProducts> {
    const res = await api.get<PagedResult<ApiProduct>>(`/products/category/${categoryId}`, {
      params: { page: 1, pageSize: 10, ...params },
    });
    return { ...res.data, items: res.data.items.map(mapProduct) };
  },

  async getById(id: number): Promise<Product> {
    const res = await api.get<ApiProduct>(`/products/${id}`);
    return mapProduct(res.data);
  },

  // Returns the full raw backend shape for every product (incl.
  // productCode/unit/importPrice/status) — needed by admin listings that
  // show cost data the customer-facing Product type doesn't carry.
  async getAllRaw(): Promise<ApiProductRaw[]> {
    const res = await api.get<PagedResult<ApiProductRaw>>("/products", {
      params: { page: 1, pageSize: 1000 },
    });
    return res.data.items;
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
