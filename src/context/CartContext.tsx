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

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const generateVariantKey = (variants: Record<string, string>) => {
    return Object.entries(variants)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => `${k}:${v}`)
      .join('|');
  };

  const addToCart = (product: Product, variants: Record<string, string> = {}, quantity: number = 1) => {
    setCart((prev) => {
      const existingItemIndex = prev.findIndex(item => 
        item.id === product.id && JSON.stringify(item.selectedVariants) === JSON.stringify(variants)
      );

      if (existingItemIndex > -1) {
        const newCart = [...prev];
        newCart[existingItemIndex].quantity += quantity;
        return newCart;
      }

      return [...prev, { ...product, quantity, selectedVariants: variants }];
    });
  };

  const removeFromCart = (productId: string, variantKey?: string) => {
    setCart((prev) => prev.filter(item => {
      if (!variantKey) return item.id !== productId;
      const currentKey = generateVariantKey(item.selectedVariants);
      return !(item.id === productId && currentKey === variantKey);
    }));
  };

  const updateQuantity = (productId: string, quantity: number, variantKey?: string) => {
    if (quantity < 1) return;
    setCart((prev) => prev.map(item => {
      const currentKey = generateVariantKey(item.selectedVariants);
      if (item.id === productId && (variantKey ? currentKey === variantKey : true)) {
        return { ...item, quantity };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
