// src/app/api/orders/route.ts
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { Cart, Order } from '@/lib/models';
import type { CartDoc } from '@/lib/types';

// Replace this with Firebase Admin ID token verification in production
async function getUid(req: Request): Promise<string> {
  const uid = req.headers.get('x-firebase-uid') || '';
  if (!uid) throw new Error('Missing user UID');
  return uid;
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const uid = await getUid(req);
    const { shipping } = await req.json();

    const cart = await Cart.findOne({ firebaseUid: uid })
      .lean<CartDoc | null>();

    if (!cart || !cart.items?.length) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const order = await Order.create({
      firebaseUid: uid,
      items: cart.items,
      amount: cart.subtotal,
      currency: cart.currency || 'INR',
      status: 'created',
      shipping,
    });

    await Cart.updateOne({ firebaseUid: uid }, { $set: { items: [], subtotal: 0 } });

    return NextResponse.json(order, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}