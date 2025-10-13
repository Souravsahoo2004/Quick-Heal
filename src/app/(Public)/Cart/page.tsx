// src/app/(Public)/Cart/page.tsx
'use client';

import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';

// Define the CartItem interface locally if needed
interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  img: string;
}

export default function CartPage() {
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    clearCart, 
    getSubtotal 
  } = useCart();
  const router = useRouter();

  const handleIncrease = (id: number) => {
    const item = cartItems.find((item: CartItem) => item.id === id);
    if (item) {
      updateQuantity(id, item.qty + 1);
    }
  };

  const handleDecrease = (id: number) => {
    const item = cartItems.find((item: CartItem) => item.id === id);
    if (item && item.qty > 1) {
      updateQuantity(id, item.qty - 1);
    }
  };

  const subtotal = getSubtotal();
  const delivery = subtotal > 0 ? 30 : 0;
  const total = subtotal + delivery;

  const handleProceedToCheckout = () => {
    router.push('/Checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <Card className="w-full max-w-4xl shadow-md rounded-2xl bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <ShoppingCart className="text-blue-500" /> My Cart
            </h2>
            {cartItems.length > 0 && (
              <Button variant="ghost" onClick={clearCart} className="text-red-600 hover:text-red-700">
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
              {cartItems.map((item: CartItem) => (
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
                      onClick={() => removeFromCart(item.id)}
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

            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto px-8 py-2"
              onClick={handleProceedToCheckout}
            >
              Proceed to Checkout
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
