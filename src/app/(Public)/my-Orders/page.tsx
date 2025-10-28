// src/app/(Public)/my-Orders/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, XCircle, Info, ShoppingBag, Trash2, Package } from "lucide-react";
import Image from "next/image";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useRouter } from "next/navigation";
import { Id } from "convex/_generated/dataModel";

type ConvexOrder = {
  _id: Id<"orders">;
  userId: string;
  userEmail: string;
  productId: Id<"products">;
  productName?: string;
  productImage?: string;
  productPrice?: number;
  quantity: number;
  totalPrice: number;
  status: string;
  shippingAddress?: string;
  orderDate: number;
  adminUid?: string;
};

export default function MyOrders() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<Id<"orders"> | null>(null);

  // ✅ Get orders from Convex instead of Firebase
  const orders = useQuery(
    api.orders.getUserOrders,
    userId ? { userId } : "skip"
  ) as ConvexOrder[] | undefined;

  // ✅ Convex mutations
  const deleteOrder = useMutation(api.orders.deleteOrder);
  const updateOrderStatus = useMutation(api.orders.updateOrderStatus);

  // Firebase auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleDeleteOrder = async (orderId: Id<"orders">) => {
    if (!userId) {
      alert("Not signed in");
      return;
    }

    const ok = confirm("Delete this order permanently?");
    if (!ok) return;

    try {
      setDeletingId(orderId);
      await deleteOrder({ orderId });
    } catch (e: any) {
      alert(e?.message || "Failed to delete order");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelOrder = async (orderId: Id<"orders">) => {
    if (!userId) {
      alert("Not signed in");
      return;
    }

    const ok = confirm("Cancel this order?");
    if (!ok) return;

    try {
      await updateOrderStatus({ orderId, status: "cancelled" });
      alert("Order cancelled successfully");
    } catch (e: any) {
      alert(e?.message || "Failed to cancel order");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "processing":
        return "text-blue-600 bg-blue-50";
      case "completed":
        return "text-green-600 bg-green-50";
      case "cancelled":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "⏳";
      case "processing":
        return "📦";
      case "completed":
        return "✅";
      case "cancelled":
        return "❌";
      default:
        return "📋";
    }
  };

  // Loading state
  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md p-8 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">Please Log In</h2>
          <p className="text-gray-600 mb-4">Sign in to view your orders</p>
          <Button onClick={() => router.push('/login')} className="w-full">
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  if (!orders) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-4 border-blue-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-6xl mx-auto p-6 space-y-6 mt-20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-900">My Orders</h2>
        <div className="text-sm text-gray-600">
          Total Orders: <span className="font-semibold">{orders.length}</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Orders Yet</h3>
          <p className="text-gray-600 mb-6">
            Start shopping and your orders will appear here!
          </p>
          <Button 
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => router.push('/Products')}
          >
            <ShoppingBag size={18} /> Browse Products
          </Button>
        </Card>
      ) : (
        orders.map((order) => (
          <Card 
            key={order._id} 
            className="shadow-md hover:shadow-lg transition-all rounded-2xl border-l-4"
            style={{
              borderLeftColor: 
                order.status === "completed" ? "#10b981" :
                order.status === "processing" ? "#3b82f6" :
                order.status === "cancelled" ? "#ef4444" :
                "#f59e0b"
            }}
          >
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Order #{order._id.slice(-8)}
                </h3>
                <p className="text-sm text-gray-500">
                  {new Date(order.orderDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <span className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)} {order.status.toUpperCase()}
              </span>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Product Info */}
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-4">
                  {order.productImage && (
                    <div className="relative w-20 h-20">
                      <Image
                        src={order.productImage}
                        alt={order.productName || "Product"}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-800">
                      {order.productName || "Product"}
                    </p>
                    <p className="text-sm text-gray-500">Quantity: {order.quantity}</p>
                    {order.productPrice && (
                      <p className="text-sm text-gray-500">
                        Unit Price: ₹{order.productPrice.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    ₹{order.totalPrice.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Shipping Address */}
              {order.shippingAddress && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-700 mb-1">
                    DELIVERY ADDRESS
                  </p>
                  <p className="text-sm text-gray-700">{order.shippingAddress}</p>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-wrap gap-2 border-t pt-4">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => router.push(`/TrackOrder?orderId=${order._id}`)}
              >
                <Truck size={16} /> Track Order
              </Button>

              {order.status === "pending" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-red-600 border-red-500 hover:bg-red-50"
                  onClick={() => handleCancelOrder(order._id)}
                >
                  <XCircle size={16} /> Cancel Order
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => router.push(`/order-details/${order._id}`)}
              >
                <Info size={16} /> Details
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-red-600 border-red-500 hover:bg-red-50 ml-auto"
                onClick={() => handleDeleteOrder(order._id)}
                disabled={deletingId === order._id}
                title="Delete order"
              >
                <Trash2 size={16} />
                {deletingId === order._id ? "Deleting..." : "Delete"}
              </Button>
            </CardFooter>
          </Card>
        ))
      )}
    </section>
  );
}
