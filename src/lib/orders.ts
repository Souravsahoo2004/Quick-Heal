// src/lib/orders.ts
import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase";

type Address = {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
};

export async function placeOrderFromCart(address: Address, deliveryFee: number) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");

  const cartCol = collection(firestore, "users", user.uid, "cartItems");
  const cartSnap = await getDocs(cartCol);
  if (cartSnap.empty) throw new Error("Cart is empty");

  const items = cartSnap.docs.map((d) => {
    const data = d.data() as any;
    return {
      productId: Number(d.id),
      name: data.name,
      price: data.price,
      qty: data.qty,
      img: data.img || "",
    };
  });

  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const total = subtotal + deliveryFee;

  // Create order doc with a generated id and write via batch
  const orderRef = doc(collection(firestore, "users", user.uid, "orders"));
  const batch = writeBatch(firestore);

  batch.set(orderRef, {
    status: "pending",
    subtotal,
    deliveryFee,
    total,
    itemCount: items.length,
    items, // embed for simple reads; switch to subcollection if orders can be huge
    address,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  cartSnap.forEach((d) => batch.delete(d.ref));

  await batch.commit();
  return { orderId: orderRef.id, total };
}
