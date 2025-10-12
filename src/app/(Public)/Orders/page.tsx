'use client';

import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, MapPin, FileText, Truck } from 'lucide-react';

export default function OrderPage() {
  const order = {
    id: '#QH123456',
    date: 'Oct 12, 2025',
    status: 'Out for Delivery',
    expectedDelivery: 'Oct 14, 2025',
    items: [
      {
        name: 'Paracetamol 500mg',
        qty: 2,
        price: 50,
        img: '/images/para.jpg',
      },
      {
        name: 'Vitamin C Tablets',
        qty: 1,
        price: 120,
        img: '/images/vitc.jpg',
      },
    ],
    address: 'Sourav Sahoo, Plot-25, Bhubaneswar, Odisha, 751001',
  };

  const total = order.items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <Card className="w-full max-w-3xl shadow-md rounded-2xl bg-white">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Order Details</h2>
              <p className="text-sm text-gray-500">{order.date}</p>
            </div>
            <span className="text-sm font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
              {order.status}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Items Section */}
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center border-b pb-4 last:border-none"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover border"
                  />
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                  </div>
                </div>
                <p className="font-semibold text-gray-700">₹{item.price * item.qty}</p>
              </div>
            ))}
          </div>

          {/* Address Section */}
          <div className="flex gap-3 bg-gray-50 p-4 rounded-lg border">
            <MapPin className="text-blue-500 w-5 h-5 mt-1" />
            <div>
              <p className="font-medium text-gray-800">Delivery Address</p>
              <p className="text-sm text-gray-600">{order.address}</p>
              <p className="text-xs text-gray-500 mt-1">
                Expected Delivery: <span className="font-semibold text-green-600">{order.expectedDelivery}</span>
              </p>
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="font-medium text-gray-800 mb-3">Price Summary</h3>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Subtotal</span>
              <span>₹{total}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Delivery Fee</span>
              <span>₹30</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-gray-800 mt-2 border-t pt-2">
              <span>Total</span>
              <span>₹{total + 30}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 mt-4">
          <Button variant="outline" className="flex items-center gap-2">
            <Truck size={18} />
            Track Order
          </Button>
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
            <FileText size={18} />
            Download Invoice
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
