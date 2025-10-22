// src/app/(Public)/my-order/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, XCircle, Info, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import { auth, firestore } from "@/lib/firebase";
import { collection, onSnapshot, orderBy, query, doc, deleteDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

type Order = {
  id: string;
  status: string;
  total: number;
  itemCount: number;
  items?: { name: string; img?: string; qty: number; price: number }[];
  createdAt?: any;
};

export default function MyOrders() {
  const router = useRouter(); // <-- move hook inside component

  const [orders, setOrders] = useState<Order[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const q = query(
      collection(firestore, "users", user.uid, "orders"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Order[]);
    });
    return () => unsub();
  }, []);

  const handleDeleteOrder = async (orderId: string) => {
    const user = auth.currentUser;
    if (!user) return alert("Not signed in");
    const ok = confirm("Delete this order permanently?");
    if (!ok) return;

    try {
      setDeletingId(orderId);
      const ref = doc(firestore, "users", user.uid, "orders", orderId);
      await deleteDoc(ref);
    } catch (e: any) {
      alert(e?.message || "Failed to delete order");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="max-w-6xl mx-auto p-6 space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">My Orders</h2>

      {orders.map((order) => (
        <Card key={order.id} className="shadow-md hover:shadow-lg transition-all rounded-2xl">
          <CardHeader className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Order ID: {order.id}</h3>
            <span className="text-sm text-blue-600 font-medium">Status: {order.status}</span>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            {(order.items || []).map((it, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20">
                    <Image
                      src={it.img || "/images/placeholder.png"}
                      alt={it.name}
                      fill
                      className="object-contain rounded-xl"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">{it.name}</p>
                    <p className="text-sm text-gray-500">Qty: {it.qty}</p>
                  </div>
                </div>
                <p className="font-medium">₹{it.price}</p>
              </div>
            ))}
          </CardContent>

          <CardFooter className="flex justify-between items-center border-t pt-3">
            <div className="text-sm text-gray-700">
              <span className="font-semibold">Total:</span> ₹{order.total} •{" "}
              <span className="font-semibold">Items:</span> {order.itemCount}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => router.push(`/TrackOrder?orderId=${order.id}`)} // navigate via hook
              >
                <Truck size={18} /> Track Order
              </Button>
              <Button variant="outline" className="gap-2 text-red-600 border-red-500 hover:bg-red-50">
                <XCircle size={18} /> Cancel
              </Button>
              <Button variant="outline" className="gap-2">
                <Info size={18} /> More
              </Button>
              <Button
                variant="outline"
                className="gap-2 text-red-600 border-red-500 hover:bg-red-50"
                onClick={() => handleDeleteOrder(order.id)}
                disabled={deletingId === order.id}
                title="Delete order"
              >
                <Trash2 size={18} />
                {deletingId === order.id ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}

      {orders.length === 0 && (
        <Card className="p-6">
          <p className="text-gray-600">No orders yet.</p>
          <div className="mt-3">
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <ShoppingBag size={18} /> Shop More
            </Button>
          </div>
        </Card>
      )}
    </section>
  );
}
