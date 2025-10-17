// src/lib/models.ts
import { Schema, model, models, type InferSchemaType } from 'mongoose';

// Product
export interface ProductDoc {
  sku?: string;
  name: string;
  price: number;
  images?: string[];
  stock?: number;
  attrs?: Record<string, any>;
}

const ProductSchema = new Schema<ProductDoc>(
  {
    sku: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    images: [String],
    stock: { type: Number, default: 0 },
    attrs: Schema.Types.Mixed,
  },
  { timestamps: true }
);

// Let Schema typing drive the model type inference
export const Product = models.Product || model('Product', ProductSchema);

// Cart
export interface CartItemDoc {
  productId: Schema.Types.ObjectId;
  qty: number;
  priceAtAdd: number;
}

export interface CartDoc {
  firebaseUid: string;
  items: CartItemDoc[];
  subtotal: number;
  currency?: string;
}

const CartItemSchema = new Schema<CartItemDoc>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    qty: { type: Number, required: true, min: 1 },
    priceAtAdd: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const CartSchema = new Schema<CartDoc>(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    items: { type: [CartItemSchema], default: [] },
    subtotal: { type: Number, required: true, default: 0, min: 0 },
    currency: { type: String, default: 'INR' },
  },
  { timestamps: true }
);

export const Cart = models.Cart || model('Cart', CartSchema);

// Order
export interface OrderDoc {
  firebaseUid: string;
  items: CartItemDoc[];
  amount: number;
  currency?: string;
  status: 'created' | 'paid' | 'shipped' | 'delivered' | 'canceled' | 'refunded';
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
}

const OrderSchema = new Schema<OrderDoc>(
  {
    firebaseUid: { type: String, required: true, index: true },
    items: { type: [CartItemSchema], default: [] },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['created', 'paid', 'shipped', 'delivered', 'canceled', 'refunded'],
      default: 'created',
    },
    shipping: {
      name: String,
      phone: String,
      address1: String,
      address2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
  },
  { timestamps: true }
);

export const Order = models.Order || model('Order', OrderSchema);

// If you still want value-level types inferred from schemas:
export type ProductShape = InferSchemaType<typeof ProductSchema>;
export type CartShape = InferSchemaType<typeof CartSchema>;
export type OrderShape = InferSchemaType<typeof OrderSchema>;
