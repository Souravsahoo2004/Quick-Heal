// src/contexts/CartContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { toast } from "sonner";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase";

interface CartItem {
  id: number | string; // Updated to support both number and string
  name: string;
  price: number;
  qty: number;
  img: string;
}

interface Product {
  id: number | string; // Updated to support both number and string
  name: string;
  price: number;
  oldPrice: number;
  discount: number;
  image: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => Promise<void>;
  updateQuantity: (id: number | string, qty: number) => Promise<void>; // Updated parameter type
  removeFromCart: (id: number | string) => Promise<void>; // Updated parameter type
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [uid, setUid] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setUid(user ? user.uid : null));
    return () => unsub();
  }, []);

  // Live subscribe to Firestore cart
  useEffect(() => {
    if (!uid) {
      setCartItems([]);
      return;
    }
    const colRef = collection(firestore, "users", uid, "cartItems");
    const unsub = onSnapshot(colRef, (snap) => {
      const list: CartItem[] = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id, // Keep as string from Firestore document ID
          name: data.name,
          price: data.price,
          qty: data.qty,
          img: data.img || "/images/default.jpg",
        };
      });
      setCartItems(list);
    });
    return () => unsub();
  }, [uid]);

  const addToCart = async (product: Product) => {
    if (!uid) throw new Error("Not signed in");
    
    // Convert id to string for Firestore document ID
    const productId = String(product.id);
    const ref = doc(firestore, "users", uid, "cartItems", productId);
    
    // Use atomic increment to avoid races and create if missing
    await setDoc(
      ref,
      {
        name: product.name,
        price: product.price,
        img: product.image || "/images/default.jpg",
        qty: increment(1),
        addedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    
    toast.success(`${product.name} added to cart`, {
      description: "You can review it in your cart anytime.",
      icon: "🛒",
      duration: 2500,
    });
  };

  const updateQuantity = async (id: number | string, qty: number) => {
    if (!uid) throw new Error("Not signed in");
    
    // Convert id to string for Firestore document ID
    const productId = String(id);
    const ref = doc(firestore, "users", uid, "cartItems", productId);
    
    if (qty <= 0) {
      await deleteDoc(ref);
    } else {
      await setDoc(ref, { qty, updatedAt: serverTimestamp() }, { merge: true });
    }
  };

  const removeFromCart = async (id: number | string) => {
    if (!uid) throw new Error("Not signed in");
    
    // Convert id to string for Firestore document ID
    const productId = String(id);
    const ref = doc(firestore, "users", uid, "cartItems", productId);
    await deleteDoc(ref);
  };

  const clearCart = async () => {
    if (!uid) throw new Error("Not signed in");
    const colRef = collection(firestore, "users", uid, "cartItems");
    const snap = await getDocs(colRef);
    const batch = writeBatch(firestore);
    snap.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  };

  const getTotalItems = useMemo(
    () => () => cartItems.reduce((total, item) => total + item.qty, 0),
    [cartItems]
  );

  const getSubtotal = useMemo(
    () => () => cartItems.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cartItems]
  );

  const value: CartContextType = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalItems,
    getSubtotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
};
