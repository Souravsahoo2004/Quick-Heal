'use client';

import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Truck, XCircle, RotateCcw, Info, ShoppingBag } from 'lucide-react';
import Image from 'next/image';

interface OrderItem {
  id: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  status: string;
}

const orders: OrderItem[] = [
  {
    id: 'ORD1234',
    productName: 'Quick Heal Antivirus Pro',
    productImage: '/images/antivirus-pro.png',
    price: 499,
    quantity: 1,
    status: 'Shipped',
  },
  {
    id: 'ORD5678',
    productName: 'Quick Heal Total Security',
    productImage: '/images/total-security.png',
    price: 899,
    quantity: 1,
    status: 'Delivered',
  },
];

export default function MyOrders() {
  return (
    <section className="max-w-6xl mx-auto p-6 space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">My Orders</h2>

      {orders.map((order) => (
        <Card key={order.id} className="shadow-md hover:shadow-lg transition-all rounded-2xl">
          <CardHeader className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Order ID: {order.id}</h3>
            <span className="text-sm text-blue-600 font-medium">
              Status: {order.status}
            </span>
          </CardHeader>

          <CardContent className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-32 h-32 flex-shrink-0">
              <Image
                src={order.productImage}
                alt={order.productName}
                fill
                className="object-contain rounded-xl"
              />
            </div>

            <div className="flex-1 space-y-1">
              <h4 className="text-lg font-semibold">{order.productName}</h4>
              <p className="text-gray-500">Quantity: {order.quantity}</p>
              <p className="text-gray-800 font-medium">₹{order.price}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="gap-2">
                <Truck size={18} /> Track Order
              </Button>
              <Button variant="outline" className="gap-2 text-red-600 border-red-500 hover:bg-red-50">
                <XCircle size={18} /> Cancel
              </Button>
              <Button variant="outline" className="gap-2 text-yellow-600 border-yellow-500 hover:bg-yellow-50">
                <RotateCcw size={18} /> Return
              </Button>
              <Button variant="outline" className="gap-2">
                <Info size={18} /> More
              </Button>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between items-center border-t pt-3">
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <ShoppingBag size={18} /> Shop More
            </Button>
            <Button variant="outline" className="gap-2">
              <Package size={18} /> Related Products
            </Button>
          </CardFooter>
        </Card>
      ))}
    </section>
  );
}
