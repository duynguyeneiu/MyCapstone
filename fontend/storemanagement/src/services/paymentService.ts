import api from "../lib/paymentApi";

export interface ApiPayment {
  paymentId: number;
  orderId: number;
  paymentMethod: string;
  status: string;
  transactionCode?: string | null;
  createdAt?: string;
}

export const paymentService = {
  async getAll(): Promise<ApiPayment[]> {
    const res = await api.get<ApiPayment[]>("/Payment");
    return res.data;
  },

  async getById(id: number): Promise<ApiPayment> {
    const res = await api.get<ApiPayment>(`/Payment/${id}`);
    return res.data;
  },

  async getByOrder(orderId: number): Promise<ApiPayment> {
    const res = await api.get<ApiPayment>(`/Payment/order/${orderId}`);
    return res.data;
  },

  async create(data: { orderId: number; paymentMethod: string }): Promise<ApiPayment> {
    const res = await api.post<ApiPayment>("/Payment", data);
    return res.data;
  },

  async updateStatus(id: number, data: { status: string; transactionCode?: string }): Promise<void> {
    await api.put(`/Payment/${id}/status`, data);
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/Payment/${id}`);
  },
};
