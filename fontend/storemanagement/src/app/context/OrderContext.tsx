'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { orderService, Order } from '@/src/services/orderService';
import { useAuth } from './AuthContext';

export type { Order };

interface PlaceOrderInput {
  receiverName: string;
  receiverPhone: string;
  shippingAddress: string;
  paymentMethod: string;
}

interface OrderContextValue {
  orders: Order[];
  lastOrder: Order | null;
  placeOrder: (input: PlaceOrderInput) => Promise<Order>;
  refreshOrders: () => void;
}

const OrderContext = createContext<OrderContextValue | null>(null);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  const refreshOrders = useCallback(() => {
    const request = user ? orderService.getByUser(Number(user.id)) : Promise.resolve<Order[]>([]);
    request.then(setOrders).catch(err => console.error(err));
  }, [user]);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  const placeOrder = useCallback(async (input: PlaceOrderInput): Promise<Order> => {
    if (!user) throw new Error('Not authenticated');
    const order = await orderService.checkout({ userId: Number(user.id), ...input });
    setLastOrder(order);
    setOrders(o => [order, ...o]);
    return order;
  }, [user]);

  return (
    <OrderContext.Provider value={{ orders, lastOrder, placeOrder, refreshOrders }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrders must be used within OrderProvider');
  return ctx;
}
