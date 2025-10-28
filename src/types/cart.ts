// src/types/cart.ts
export interface CartItem {
  id: string | number; // ✅ Support both string and number IDs
  name: string;
  price: number;
  qty: number;
  img: string;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface Product {
  _id: string;
  productName: string;
  price: number;
  discountedPrice?: number;
  imageUrls?: string[];
}
