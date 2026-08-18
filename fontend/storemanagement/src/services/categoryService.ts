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
    const res = await api.get<PagedResult<ApiCategory>>("/Categories", {
      params: { page: 1, pageSize: 1000 },
    });
    return res.data.items.map(mapCategory);
  },

  async getPaged(
    params: { page?: number; pageSize?: number; keyword?: string } = {},
  ): Promise<PagedCategories> {
    const res = await api.get<PagedResult<ApiCategory>>("/Categories", {
      params: { page: 1, pageSize: 10, ...params },
    });
    return { ...res.data, items: res.data.items.map(mapCategory) };
  },

  async getById(id: number): Promise<Category> {
    const res = await api.get<ApiCategory>(`/Categories/${id}`);
    return mapCategory(res.data);
  },

  async getRawById(id: number): Promise<ApiCategoryRaw> {
    const res = await api.get<ApiCategoryRaw>(`/Categories/${id}`);
    return res.data;
  },

  async create(data: ApiCategoryRaw) {
    const res = await api.post("/Categories", data);
    return res.data;
  },

  async update(id: number, data: ApiCategoryRaw) {
    const res = await api.put(`/Categories/${id}`, data);
    return res.data;
  },

  async delete(id: number) {
    await api.delete(`/Categories/${id}`);
  },
};
