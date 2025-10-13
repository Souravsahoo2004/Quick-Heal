// src/app/(Public)/Greeting/page.tsx
'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Mail, ShoppingBag, Package } from "lucide-react";

interface OrderSummary {
  orderId: string;
  total: number;
  expectedDelivery: string;
  itemCount: number;
  customerName: string;
  emailSent: boolean;
  orderDate: string;
}

export default function GreetingPage() {
  const router = useRouter();
  const [orderInfo, setOrderInfo] = useState<OrderSummary | null>(null);

  useEffect(() => {
    console.log('Greeting page loaded');
    const savedOrderInfo = localStorage.getItem('lastOrderSummary');
    if (savedOrderInfo) {
      try {
        const parsed = JSON.parse(savedOrderInfo);
        console.log('Order info retrieved:', parsed);
        setOrderInfo(parsed);
        // Clean up localStorage after reading
        localStorage.removeItem('lastOrderSummary');
      } catch (error) {
        console.error('Error parsing order info:', error);
      }
    } else {
      console.log('No order info found in localStorage');
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-100 px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-white shadow-2xl rounded-3xl p-10 md:p-12 text-center max-w-lg w-full relative overflow-hidden"
      >
        {/* Soft glow ring */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/40 to-transparent pointer-events-none animate-pulse" />

        {/* Checkmark animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
          className="mx-auto mb-6 w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center shadow-inner"
        >
          <CheckCircle className="w-12 h-12 text-emerald-600" />
        </motion.div>

        {/* Thank you text */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-3xl font-semibold text-gray-800 mb-3"
        >
          Thank You for Shopping{orderInfo?.customerName && `, ${orderInfo.customerName}`}! 🎉
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-gray-600 text-lg mb-6"
        >
          Your order has been placed successfully. We'll notify you when it ships!
        </motion.p>

        {/* Email confirmation status */}
        {orderInfo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Mail className={`w-5 h-5 ${orderInfo.emailSent ? 'text-green-500' : 'text-blue-500'}`} />
              <span className={`text-sm font-medium ${orderInfo.emailSent ? 'text-green-600' : 'text-blue-600'}`}>
                {orderInfo.emailSent ? 'Confirmation email sent!' : 'Processing confirmation email...'}
              </span>
            </div>
            <p className="text-xs text-gray-600">
              {orderInfo.emailSent 
                ? 'Check your inbox for order details and tracking information.'
                : 'You will receive a confirmation email shortly.'
              }
            </p>
          </motion.div>
        )}

        {/* Order Summary Card */}
        {orderInfo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="bg-gray-50 rounded-lg p-4 mb-6 text-left"
          >
            <h3 className="font-semibold text-gray-800 mb-3 text-center">Order Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-semibold text-emerald-600">{orderInfo.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Items:</span>
                <span>{orderInfo.itemCount} items</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-semibold">₹{orderInfo.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date:</span>
                <span>{orderInfo.orderDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expected Delivery:</span>
                <span className="text-emerald-600 font-medium">{orderInfo.expectedDelivery}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => router.push("/")}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 hover:shadow-lg hover:scale-105 transform transition-all duration-300 flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </button>
          <button
            onClick={() => router.push("/my-orders")}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-medium bg-white hover:bg-gray-100 hover:shadow-md hover:scale-105 transform transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" />
            My Orders
          </button>
        </motion.div>

        {/* Decorative sparkles */}
        <div className="absolute -top-10 left-10 w-16 h-16 bg-emerald-300/20 rounded-full blur-2xl animate-ping"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 bg-emerald-400/10 rounded-full blur-3xl"></div>
      </motion.div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="mt-10 text-gray-500 text-sm text-center"
      >
        Need help?{" "}
        <a href="/support" className="text-emerald-600 hover:underline">
          Contact Support
        </a>
      </motion.footer>
    </div>
  );
}
