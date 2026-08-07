import api from "../lib/api";
import { Category } from "../lib/data";

interface ApiCategory {
  categoryId: number;
  categoryName: string;
  description: string | null;
  parentCategoryId: number | null;
  status: string;
}

interface PagedResult<T> {
  items: T[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiCategoryRaw extends ApiCategory {
  status: string;
  createdAt?: string;
  updatedAt?: string | null;
}

const mapCategory = (c: ApiCategory): Category => ({
  id: c.categoryId,
  name: c.categoryName,
  description: c.description ?? "",
  parentCategoryId: c.parentCategoryId,
  status: c.status,
});

export interface PagedCategories {
  items: Category[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const res = await api.get<PagedResult<ApiCategory>>("/categories", {
      params: { page: 1, pageSize: 1000 },
    });
    return res.data.items.map(mapCategory);
  },

  // Server-side pagination/search — use this over getAll() when the list
  // can grow large and you don't need every row loaded client-side at once.
  async getPaged(params: { page?: number; pageSize?: number; keyword?: string } = {}): Promise<PagedCategories> {
    const res = await api.get<PagedResult<ApiCategory>>("/categories", {
      params: { page: 1, pageSize: 10, ...params },
    });
    return { ...res.data, items: res.data.items.map(mapCategory) };
  },

  async getById(id: number): Promise<Category> {
    const res = await api.get<ApiCategory>(`/categories/${id}`);
    return mapCategory(res.data);
  },

  // Returns the raw backend shape (incl. status/createdAt) — needed so
  // edit forms can round-trip a full entity to the PUT endpoint, which
  // replaces the whole row rather than patching individual fields.
  async getRawById(id: number): Promise<ApiCategoryRaw> {
    const res = await api.get<ApiCategoryRaw>(`/categories/${id}`);
    return res.data;
  },

  async create(data: ApiCategoryRaw) {
    const res = await api.post("/categories", data);
    return res.data;
  },

  async update(id: number, data: ApiCategoryRaw) {
    const res = await api.put(`/categories/${id}`, data);
    return res.data;
  },

  async delete(id: number) {
    await api.delete(`/categories/${id}`);
  },
};
