import orderApi from "../lib/orderApi";

export interface CartItem {
  cartDetailId: number;
  productId: number;
  productName: string;
  image: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Cart {
  cartId: number;
  userId: number;
  totalAmount: number;
  items: CartItem[];
}

interface ApiCartItem {
  cartDetailId: number;
  productId: number;
  productName: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface ApiCart {
  cartId: number;
  userId: number;
  totalAmount: number;
  items: ApiCartItem[];
}

const mapCart = (c: ApiCart): Cart => ({
  cartId: c.cartId,
  userId: c.userId,
  totalAmount: c.totalAmount,
  items: c.items.map((i) => ({
    cartDetailId: i.cartDetailId,
    productId: i.productId,
    productName: i.productName,
    image: i.imageUrl ? `/image/${i.imageUrl}` : "",
    quantity: i.quantity,
    unitPrice: i.unitPrice,
    subtotal: i.subtotal,
  })),
});

export const cartService = {
  async getCart(userId: number): Promise<Cart> {
    const res = await orderApi.get<ApiCart>(`/Cart/${userId}`);
    return mapCart(res.data);
  },

  async addItem(userId: number, productId: number, quantity: number): Promise<Cart> {
    const res = await orderApi.post<ApiCart>("/Cart/items", { userId, productId, quantity });
    return mapCart(res.data);
  },

  async updateItem(cartDetailId: number, quantity: number): Promise<Cart> {
    const res = await orderApi.put<ApiCart>(`/Cart/items/${cartDetailId}`, { quantity });
    return mapCart(res.data);
  },

  async removeItem(cartDetailId: number): Promise<Cart> {
    const res = await orderApi.delete<ApiCart>(`/Cart/items/${cartDetailId}`);
    return mapCart(res.data);
  },

  async clearCart(userId: number): Promise<void> {
    await orderApi.delete(`/Cart/${userId}`);
  },
};
