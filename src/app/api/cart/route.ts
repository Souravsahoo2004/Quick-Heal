// src/app/api/cart/route.ts
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { Cart, Product } from '@/lib/models';
import type { CartDoc, ProductDoc } from '@/lib/types';

function computeSubtotal(items: { qty: number; priceAtAdd: number }[]) {
  return items.reduce((sum, i) => sum + i.qty * i.priceAtAdd, 0);
}

// Replace this with Firebase Admin ID token verification in production
async function getUid(req: Request): Promise<string> {
  const uid = req.headers.get('x-firebase-uid') || '';
  if (!uid) throw new Error('Missing user UID');
  return uid;
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    const uid = await getUid(req);

    const cart = await Cart.findOne({ firebaseUid: uid })
      .lean<CartDoc | null>();

    return NextResponse.json(cart || { items: [], subtotal: 0, currency: 'INR' }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const uid = await getUid(req);
    const { productId, qty } = await req.json();

    // Find ONE product, not an array
    const product = await Product.findById(productId)
      .select({ price: 1 })
      .lean<ProductDoc | null>();

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const price = product.price;

    const existing = await Cart.findOne({ firebaseUid: uid });

    if (!existing) {
      const items = [{ productId, qty, priceAtAdd: price }];
      const subtotal = computeSubtotal(items);
      const created = await Cart.create({ firebaseUid: uid, items, subtotal, currency: 'INR' });
      return NextResponse.json(created, { status: 201 });
    }

    const items = [...existing.items];
    const idx = items.findIndex((i) => i.productId.toString() === String(productId));
    if (idx >= 0) {
      if (qty <= 0) items.splice(idx, 1);
      else items[idx].qty = qty;
    } else {
      if (qty > 0) items.push({ productId, qty, priceAtAdd: price });
    }
    existing.subtotal = computeSubtotal(items);
    existing.items = items as any;
    await existing.save();

    return NextResponse.json(existing, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const uid = await getUid(req);

    const cart = await Cart.findOneAndUpdate(
      { firebaseUid: uid },
      { $set: { items: [], subtotal: 0 } },
      { new: true, upsert: true }
    ).lean<CartDoc>();

    return NextResponse.json(cart, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}