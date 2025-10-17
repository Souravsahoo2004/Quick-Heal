// src/contexts/CartContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';

// Define TypeScript interfaces
interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  img: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice: number;
  discount: number;
  image: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  updateQuantity: (id: number, qty: number) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        const updated = prev.map(item =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
        return updated;
      } else {
        const next: CartItem[] = [
          ...prev,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            qty: 1,
            img: product.image || '/images/default.jpg',
          },
        ];
        return next;
      }
    });

    // Single non-blocking notification
    toast.success(`${product.name} added to cart`, {
      description: 'You can review it in your cart anytime.',
      icon: '🛒',
      duration: 2500,
    });
  };

  const updateQuantity = (id: number, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems(prev =>
      prev.map(item => (item.id === id ? { ...item, qty } : item))
    );
  };

  const removeFromCart = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.qty, 0);
  };

  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  };

  const contextValue: CartContextType = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalItems,
    getSubtotal,
  };

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
