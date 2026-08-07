'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { cartService, CartItem } from '@/src/services/cartService';
import { useAuth } from './AuthContext';

export type { CartItem };

interface CartContextValue {
  cart: CartItem[];
  cartCount: number;
  totalAmount: number;
  toast: string | null;
  addToCart: (productId: number, quantity?: number) => void;
  updateQty: (cartDetailId: number, delta: number) => void;
  removeItem: (cartDetailId: number) => void;
  clearCart: () => void;
  refreshCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 2400);
  }, []);

  const applyCart = useCallback((data: { items: CartItem[]; totalAmount: number }) => {
    setCart(data.items);
    setTotalAmount(data.totalAmount);
  }, []);

  const refreshCart = useCallback(() => {
    const request = user
      ? cartService.getCart(Number(user.id))
      : Promise.resolve({ items: [] as CartItem[], totalAmount: 0 });
    request.then(applyCart).catch(err => console.error(err));
  }, [user, applyCart]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = useCallback((productId: number, quantity: number = 1) => {
    if (!user) {
      showToast('Please sign in to add items to your cart');
      return;
    }
    cartService.addItem(Number(user.id), productId, quantity)
      .then(data => {
        applyCart(data);
        const item = data.items.find(i => i.productId === productId);
        showToast(`${item?.productName ?? 'Item'} added!`);
      })
      .catch(err => {
        console.error(err);
        showToast('Could not add item to cart');
      });
  }, [user, applyCart, showToast]);

  const updateQty = useCallback((cartDetailId: number, delta: number) => {
    const item = cart.find(i => i.cartDetailId === cartDetailId);
    if (!item) return;
    const newQty = item.quantity + delta;
    const request = newQty <= 0
      ? cartService.removeItem(cartDetailId)
      : cartService.updateItem(cartDetailId, newQty);
    request.then(applyCart).catch(err => console.error(err));
  }, [cart, applyCart]);

  const removeItem = useCallback((cartDetailId: number) => {
    cartService.removeItem(cartDetailId).then(applyCart).catch(err => console.error(err));
  }, [applyCart]);

  const clearCart = useCallback(() => {
    if (!user) return;
    cartService.clearCart(Number(user.id))
      .then(() => { setCart([]); setTotalAmount(0); })
      .catch(err => console.error(err));
  }, [user]);

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, cartCount, totalAmount, toast, addToCart, updateQty, removeItem, clearCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
