'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Order, CartItem, PaymentMethod } from '../lib/types';
import { INITIAL_ORDERS } from '../lib/data';

interface OrderContextValue {
  orders: Order[];
  lastOrderId: string;
  prevCart: CartItem[];
  placeOrder: (cart: CartItem[], method: PaymentMethod) => string;
}

const OrderContext = createContext<OrderContextValue | null>(null);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [lastOrderId, setLastOrderId] = useState('#AM00000');
  const [prevCart, setPrevCart] = useState<CartItem[]>([]);

  const placeOrder = useCallback((cart: CartItem[], method: PaymentMethod): string => {
    const oid = '#AM' + Math.floor(10000 + Math.random() * 90000);
    const methodLabel = { vnpay: 'VNPay', cod: 'COD' }[method];
    const newOrder: Order = {
      id: oid,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'processing',
      payment: methodLabel,
      items: cart.map(i => ({ pid: i.id, qty: i.qty })),
    };
    setOrders(o => [newOrder, ...o]);
    setPrevCart([...cart]);
    setLastOrderId(oid);
    return oid;
  }, []);

  return (
    <OrderContext.Provider value={{ orders, lastOrderId, prevCart, placeOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrders must be used within OrderProvider');
  return ctx;
}
