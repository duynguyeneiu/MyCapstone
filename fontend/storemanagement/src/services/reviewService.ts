import api from "../lib/reviewApi";

export interface ApiReview {
  reviewId: number;
  productId: number;
  userId: number;
  rating: number;
  comment: string | null;
  createdAt?: string;
}

export interface ReviewWrite {
  rating: number;
  comment?: string;
}

export const reviewService = {
  async getAll(): Promise<ApiReview[]> {
    const res = await api.get<ApiReview[]>("/Reviews");
    return res.data;
  },

  async getByProduct(productId: number): Promise<ApiReview[]> {
    const res = await api.get<ApiReview[]>(`/Reviews/product/${productId}`);
    return res.data;
  },

  async getById(id: number): Promise<ApiReview> {
    const res = await api.get<ApiReview>(`/Reviews/${id}`);
    return res.data;
  },

  async create(data: { productId: number } & ReviewWrite): Promise<ApiReview> {
    const res = await api.post<ApiReview>("/Reviews", data);
    return res.data;
  },

  async update(id: number, data: ReviewWrite): Promise<void> {
    await api.put(`/Reviews/${id}`, data);
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/Reviews/${id}`);
  },
};
