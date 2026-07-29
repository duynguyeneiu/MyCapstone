'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { CartItem } from '../lib/types';
import { productService } from '@/src/services/productService';
import { Product } from '@/src/lib/data';

interface CartContextValue {
  cart: CartItem[];
  cartCount: number;
  toast: string | null;
  addToCart: (id: number) => void;
  updateQty: (id: number, delta: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('aq-cart');
      if (saved) setCart(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    productService.getAll().then(setProducts).catch(err => console.error(err));
  }, []);

  useEffect(() => {
    localStorage.setItem('aq-cart', JSON.stringify(cart));
  }, [cart]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 2400);
  }, []);

  const addToCart = useCallback((id: number) => {
    setCart(c => {
      const existing = c.find(i => i.id === id);
      if (existing) return c.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { id, qty: 1 }];
    });
    showToast(`${products.find(p => p.id === id)?.name} added!`);
  }, [showToast, products]);

  const updateQty = useCallback((id: number, delta: number) => {
    setCart(c => c.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0));
  }, []);

  const removeItem = useCallback((id: number) => {
    setCart(c => c.filter(i => i.id !== id));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{ cart, cartCount, toast, addToCart, updateQty, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
