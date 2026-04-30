import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, variants?: Record<string, string>, quantity?: number) => void;
  removeFromCart: (productId: string, variantKey?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantKey?: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// ── Safe localStorage helpers ──────────────────────────────────────────────────
function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem('cart');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Basic schema guard: must be an array
    if (!Array.isArray(parsed)) return [];
    return parsed as CartItem[];
  } catch {
    // Handles: JSON.parse errors, Safari private mode SecurityError
    return [];
  }
}

function writeCart(cart: CartItem[]): void {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch {
    // Swallow write errors (private mode, storage full) — cart still works in memory
  }
}

// ── Provider ───────────────────────────────────────────────────────────────────
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(readCart);

  useEffect(() => { writeCart(cart); }, [cart]);

  const generateVariantKey = (variants: Record<string, string>): string =>
    Object.entries(variants)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join('|');

  const addToCart = (product: Product, variants: Record<string, string> = {}, quantity = 1) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(
        item => item.id === product.id &&
          generateVariantKey(item.selectedVariants) === generateVariantKey(variants),
      );
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = { ...next[existingIndex], quantity: next[existingIndex].quantity + quantity };
        return next;
      }
      return [...prev, { ...product, quantity, selectedVariants: variants }];
    });
  };

  const removeFromCart = (productId: string, variantKey?: string) => {
    setCart(prev => prev.filter(item => {
      if (item.id !== productId) return true;
      if (!variantKey) return false;
      return generateVariantKey(item.selectedVariants) !== variantKey;
    }));
  };

  const updateQuantity = (productId: string, quantity: number, variantKey?: string) => {
    if (quantity < 1) { removeFromCart(productId, variantKey); return; }
    setCart(prev => prev.map(item => {
      if (item.id !== productId) return item;
      if (variantKey && generateVariantKey(item.selectedVariants) !== variantKey) return item;
      return { ...item, quantity };
    }));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((t, i) => t + i.quantity, 0);
  const cartTotal = cart.reduce((t, i) => t + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};
