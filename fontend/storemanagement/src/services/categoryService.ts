import api from "../lib/api";
import { Category } from "../lib/data";

interface ApiCategory {
  categoryId: number;
  categoryName: string;
  description: string | null;
  parentCategoryId: number | null;
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
});

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const res = await api.get<ApiCategory[]>("/categories");
    return res.data.map(mapCategory);
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
