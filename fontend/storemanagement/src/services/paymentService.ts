import api from "../lib/paymentApi";

export interface ApiPayment {
  paymentId: number;
  orderId: number;
  amount: number;
  paymentMethod: string;
  status: string; // Pending | Completed | Failed | Cancelled
  txnRef: string;
  transactionCode?: string | null;
  responseCode?: string | null;
  bankCode?: string | null;
  paymentDate?: string | null;
  createdAt?: string;
}

// Same response shape for VNPay and MoMo
export interface OnlinePaymentResponse {
  paymentId: number;
  txnRef: string;
  paymentUrl: string;
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

  // Backend returns an ARRAY (one order can have several payment attempts)
  async getByOrder(orderId: number): Promise<ApiPayment[]> {
    const res = await api.get<ApiPayment[]>(`/Payment/order/${orderId}`);
    return res.data;
  },

  async getByTxnRef(txnRef: string): Promise<ApiPayment> {
    const res = await api.get<ApiPayment>(`/Payment/txn/${encodeURIComponent(txnRef)}`);
    return res.data;
  },

  async create(data: { orderId: number; paymentMethod: string }): Promise<ApiPayment> {
    const res = await api.post<ApiPayment>("/Payment", data);
    return res.data;
  },

  async createVnPay(orderId: number): Promise<OnlinePaymentResponse> {
    const res = await api.post<OnlinePaymentResponse>("/Payment/vnpay/create", { orderId });
    return res.data;
  },

  async createMoMo(orderId: number): Promise<OnlinePaymentResponse> {
    const res = await api.post<OnlinePaymentResponse>("/Payment/momo/create", { orderId });
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/Payment/${id}`);
  },
};
