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

export const orderService = {
  async checkout(data: CheckoutRequest): Promise<Order> {
    const res = await orderApi.post<Order>("/order/checkout", data);
    return res.data;
  },

  async getByUser(userId: number): Promise<Order[]> {
    const res = await orderApi.get<Order[]>(`/order/user/${userId}`);
    return res.data;
  },

  async getAll(): Promise<Order[]> {
    const res = await orderApi.get<Order[]>("/order");
    return res.data;
  },

  async getById(orderId: number): Promise<Order> {
    const res = await orderApi.get<Order>(`/order/${orderId}`);
    return res.data;
  },

  async cancel(orderId: number): Promise<void> {
    await orderApi.put(`/order/${orderId}/cancel`);
  },

  async updateStatus(orderId: number, status: string): Promise<void> {
    await orderApi.put(`/order/${orderId}/status`, { status });
  },
};
