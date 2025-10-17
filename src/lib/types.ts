// lib/types.ts
import { Types } from 'mongoose';

export type ObjectId = Types.ObjectId;

export interface ProductDoc {
  _id: ObjectId;
  sku?: string;
  name: string;
  price: number;
  images?: string[];
  stock?: number;
  attrs?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CartItem {
  productId: ObjectId;
  qty: number;
  priceAtAdd: number;
}

export interface CartDoc {
  _id: ObjectId;
  firebaseUid: string;
  items: CartItem[];
  subtotal: number;
  currency: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type OrderStatus = 'created' | 'paid' | 'shipped' | 'delivered' | 'canceled' | 'refunded';

export interface OrderDoc {
  _id: ObjectId;
  firebaseUid: string;
  items: CartItem[];
  amount: number;
  currency: string;
  status: OrderStatus;
  shipping?: {
    name?: string;
    phone?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
