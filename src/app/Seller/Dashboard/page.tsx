"use client";

import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { ShoppingCart, IndianRupee, PackageCheck, Users } from "lucide-react";

const Admin_Dashboard: React.FC = () => {
  const [adminUid, setAdminUid] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const orders = useQuery(
    api.orders.getOrdersByAdmin,
    adminUid ? { adminUid } : "skip"
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAdminUid(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  if (!adminUid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Please log in to view dashboard</p>
      </div>
    );
  }

  if (!orders) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  // --------------------------
  // 🧠 Data Processing Section
  // --------------------------

  // Weekly grouping
  const weekMap: Record<string, any> = {};
  const now = new Date();

  orders.forEach((order) => {
    const date = new Date(order.orderDate);
    const weekNumber = Math.ceil((date.getDate() - 1) / 7); // week of month
    const month = date.toLocaleString("default", { month: "short" });
    const key = `${month}-W${weekNumber}`;

    if (!weekMap[key]) {
      weekMap[key] = { name: key, revenue: 0, items: 0 };
    }
    weekMap[key].revenue += order.totalPrice;
    weekMap[key].items += order.quantity;
  });

  const weeklyData = Object.values(weekMap).sort((a: any, b: any) =>
    a.name.localeCompare(b.name)
  );

  // Total stats
  const totalRevenue = orders.reduce((acc, o) => acc + o.totalPrice, 0);
  const totalItems = orders.reduce((acc, o) => acc + o.quantity, 0);
  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;
  const processingOrders = orders.filter((o) => o.status === "processing").length;

  // Top 3 selling products
  const productMap: Record<string, any> = {};
  orders.forEach((order) => {
    if (!productMap[order.productName]) {
      productMap[order.productName] = { name: order.productName, qty: 0, revenue: 0 };
    }
    productMap[order.productName].qty += order.quantity;
    productMap[order.productName].revenue += order.totalPrice;
  });

  const topProducts = Object.values(productMap)
    .sort((a: any, b: any) => b.qty - a.qty)
    .slice(0, 3);

  // --------------------------
  // 🎨 UI Section
  // --------------------------

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 mt-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <PackageCheck className="text-green-600" size={30} />
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Overview of your weekly performance and order insights
          </p>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white shadow-md rounded-xl p-5 flex items-center justify-between border-l-4 border-green-500">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900">₹{totalRevenue.toFixed(2)}</h3>
            </div>
            <IndianRupee className="text-green-600" size={32} />
          </div>

          <div className="bg-white shadow-md rounded-xl p-5 flex items-center justify-between border-l-4 border-blue-500">
            <div>
              <p className="text-sm text-gray-500">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalOrders}</h3>
            </div>
            <ShoppingCart className="text-blue-500" size={32} />
          </div>

          <div className="bg-white shadow-md rounded-xl p-5 flex items-center justify-between border-l-4 border-yellow-500">
            <div>
              <p className="text-sm text-gray-500">Processing Orders</p>
              <h3 className="text-2xl font-bold text-gray-900">{processingOrders}</h3>
            </div>
            <ClockIcon />
          </div>

          <div className="bg-white shadow-md rounded-xl p-5 flex items-center justify-between border-l-4 border-indigo-500">
            <div>
              <p className="text-sm text-gray-500">Completed Orders</p>
              <h3 className="text-2xl font-bold text-gray-900">{completedOrders}</h3>
            </div>
            <PackageCheck className="text-indigo-500" size={32} />
          </div>
        </div>

        {/* Weekly Revenue Chart */}
        <div className="bg-white shadow-md rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Weekly Revenue Overview
          </h2>
          <div className="w-full" style={{ height: '288px' }}>
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#16a34a" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Weekly Items Sold */}
        <div className="bg-white shadow-md rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Weekly Items Sold
          </h2>
          <div className="w-full" style={{ height: '288px' }}>
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="items" stroke="#3b82f6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white shadow-md rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Top Selling Products
          </h2>
          <div className="space-y-4">
            {topProducts.map((p: any, idx: number) => (
              <div
                key={p.name}
                className="flex items-center justify-between border-b pb-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-700 font-medium">
                    {idx + 1}. {p.name}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {p.qty} sold — ₹{p.revenue.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple clock icon fallback
const ClockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="#eab308"
    className="w-8 h-8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v6l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export default Admin_Dashboard;
