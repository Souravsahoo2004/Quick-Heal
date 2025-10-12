'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';

export default function CartPage() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: 'Paracetamol 500mg',
      price: 50,
      qty: 2,
      img: '/images/para.jpg',
    },
    {
      id: 2,
      name: 'Vitamin C Tablets',
      price: 120,
      qty: 1,
      img: '/images/vitc.jpg',
    },
  ]);

  const handleIncrease = (id: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  const handleDecrease = (id: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id && item.qty > 1 ? { ...item, qty: item.qty - 1 } : item
      )
    );
  };

  const handleRemove = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const delivery = subtotal > 0 ? 30 : 0;
  const total = subtotal + delivery;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <Card className="w-full max-w-4xl shadow-md rounded-2xl bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <ShoppingCart className="text-blue-500" /> My Cart
            </h2>
            {cartItems.length > 0 && (
              <Button variant="ghost" onClick={handleClearCart} className="text-red-600 hover:text-red-700">
                <Trash2 size={16} />
                Clear Cart
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {cartItems.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <ShoppingCart className="mx-auto mb-3 text-gray-400" size={40} />
              <p>Your cart is empty!</p>
              <p className="text-sm mt-1">Add some medicines to continue shopping.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {cartItems.map(item => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row justify-between items-center border-b pb-4 gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.img}
                      alt={item.name}
                      className="w-20 h-20 rounded-lg object-cover border"
                    />
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-500">₹{item.price} per unit</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDecrease(item.id)}
                    >
                      <Minus size={14} />
                    </Button>
                    <span className="w-6 text-center font-semibold">{item.qty}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleIncrease(item.id)}
                    >
                      <Plus size={14} />
                    </Button>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-gray-700">
                      ₹{item.price * item.qty}
                    </p>
                    <Button
                      variant="ghost"
                      onClick={() => handleRemove(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        {cartItems.length > 0 && (
          <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-5 border-t pt-6">
            <div className="w-full sm:w-auto bg-gray-50 p-4 rounded-lg border shadow-sm">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Delivery Fee</span>
                <span>₹{delivery}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-gray-800 mt-2 border-t pt-2">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>

            <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto px-8 py-2">
              Proceed to Checkout
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
