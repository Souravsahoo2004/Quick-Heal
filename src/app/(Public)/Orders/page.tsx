'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, MapPin, FileText, Truck } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';

// Interfaces
interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  img: string;
}

interface Address {
  id: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export default function OrderPage() {
  const { cartItems, getSubtotal, clearCart } = useCart();
  const router = useRouter();

  const [orderId] = useState<string>(
    `#QH${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  );
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);

  const subtotal = getSubtotal();
  const delivery = 30;
  const total = subtotal + delivery;

  // ✅ Load selected address only once (not dependent on cartItems length)
  useEffect(() => {
    try {
      const selectedAddressId = localStorage.getItem('selectedAddressId');
      const savedAddresses = localStorage.getItem('userAddresses');

      if (!selectedAddressId || !savedAddresses) {
        router.push('/Checkout');
        return;
      }

      const addresses: Address[] = JSON.parse(savedAddresses);
      const selectedAddr = addresses.find(
        (addr: Address) => addr.id === selectedAddressId
      );

      if (!selectedAddr) {
        router.push('/Checkout');
        return;
      }

      setSelectedAddress(selectedAddr);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading address:', error);
      router.push('/Checkout');
    }
  }, [router]);

  // ✅ Email sending (optional)
  const sendOrderConfirmationEmail = async (orderData: any) => {
    try {
      const response = await fetch('/api/send-order-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: 'customer@example.com',
          customerName: orderData.address.name,
          orderNumber: orderData.id,
          orderDate: orderData.date,
          items: orderData.items,
          address: orderData.address,
          subtotal,
          delivery,
          total,
          expectedDelivery: orderData.expectedDelivery,
        }),
      });
      return response.ok;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  };

  // ✅ Place order and redirect to Greeting
  const handlePlaceOrder = async () => {
    try {
      setIsPlacingOrder(true);

      const orderData = {
        id: orderId,
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        expectedDelivery: new Date(
          Date.now() + 2 * 24 * 60 * 60 * 1000
        ).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        items: cartItems,
        address: selectedAddress,
      };

      await new Promise((resolve) => setTimeout(resolve, 1500)); // fake delay
      await sendOrderConfirmationEmail(orderData);

      const orderSummary = {
        orderId,
        total,
        expectedDelivery: orderData.expectedDelivery,
        itemCount: cartItems.length,
        customerName: selectedAddress?.name,
        orderDate: orderData.date,
      };

      localStorage.setItem('lastOrderSummary', JSON.stringify(orderSummary));

      // ✅ redirect first → clearCart after redirect
      router.push('/Greeting');

      setTimeout(() => {
        clearCart();
        localStorage.removeItem('selectedAddressId');
      }, 500);

      setIsPlacingOrder(false);
    } catch (error) {
      console.error('Error placing order:', error);
      setIsPlacingOrder(false);
      alert('There was an error placing your order. Please try again.');
    }
  };

  const handleChangeAddress = () => {
    router.push('/Checkout');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full"></div>
        <p className="mt-3 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!selectedAddress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No address selected. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
      <Card className="w-full max-w-3xl shadow-md rounded-2xl bg-white">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Order Summary</h2>
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
            <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
              Ready to Place
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Items */}
          <div>
            <h3 className="font-medium text-gray-800 border-b pb-2">Items</h3>
            {cartItems.map((item: CartItem, i: number) => (
              <div key={i} className="flex justify-between py-4 border-b last:border-none">
                <div className="flex items-center gap-4">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg border object-cover"
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

          {/* Address */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex justify-between items-start mb-2">
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-blue-500 mt-1" />
                <div>
                  <p className="font-medium">{selectedAddress.name}</p>
                  <p className="text-sm text-gray-600">{selectedAddress.phone}</p>
                  <p className="text-sm text-gray-600">
                    {selectedAddress.addressLine1},{' '}
                    {selectedAddress.addressLine2 && `${selectedAddress.addressLine2}, `}
                    {selectedAddress.city}, {selectedAddress.state} -{' '}
                    {selectedAddress.pincode}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleChangeAddress}
                className="text-blue-600"
              >
                Change
              </Button>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Truck className="w-3 h-3" />
              Expected Delivery:{' '}
              <span className="font-semibold text-green-600">
                {new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </p>
          </div>

          {/* Price Summary */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="font-medium text-gray-800 mb-3">Price Summary</h3>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Delivery Fee</span>
              <span>₹{delivery}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-800 mt-2 border-t pt-2">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 mt-4 pt-6 border-t">
          <Button
            variant="outline"
            className="flex items-center gap-2 w-full sm:w-auto"
            onClick={() => router.push('/Cart')}
            disabled={isPlacingOrder}
          >
            <FileText size={18} />
            Back to Cart
          </Button>
          <Button
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto px-8 disabled:opacity-50"
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder}
          >
            {isPlacingOrder ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Placing Order...
              </>
            ) : (
              <>
                <Package size={18} />
                Place Order (₹{total})
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
