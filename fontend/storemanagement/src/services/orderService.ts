import orderApi from "../lib/orderApi";

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  orderId: number;
  orderNumber: string;
  userId: number;
  orderDate: string;
  totalAmount: number;
  orderType: string;
  receiverName: string;
  receiverPhone: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  shippingAddress: string;
  items: OrderItem[];
}

export interface CheckoutRequest {
  userId: number;
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
  paymentMethod: string;
}

export interface PosCheckoutItem {
  productId: number;
  quantity: number;
}

export interface PosCheckoutRequest {
  staffUserId?: number;
  receiverName?: string;
  paymentMethod: string;
  items: PosCheckoutItem[];
}

export const orderService = {
  async checkout(data: CheckoutRequest): Promise<Order> {
    const res = await orderApi.post<Order>("/Order/checkout", data);
    return res.data;
  },

  async checkoutPos(data: PosCheckoutRequest): Promise<Order> {
    const res = await orderApi.post<Order>("/Order/pos-checkout", data);
    return res.data;
  },

  async getByUser(userId: number): Promise<Order[]> {
    const res = await orderApi.get<Order[]>(`/Order/user/${userId}`);
    return res.data;
  },

  async getAll(): Promise<Order[]> {
    const res = await orderApi.get<Order[]>("/Order");
    return res.data;
  },

  async getById(orderId: number): Promise<Order> {
    const res = await orderApi.get<Order>(`/Order/${orderId}`);
    return res.data;
  },

  async cancel(orderId: number): Promise<void> {
    await orderApi.put(`/Order/${orderId}/cancel`);
  },

  async updateStatus(orderId: number, status: string): Promise<void> {
    await orderApi.put(`/Order/${orderId}/status`, { status });
  },
};
