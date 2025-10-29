"use client";

import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { Package, CheckCircle, XCircle, Clock, Eye } from "lucide-react";

const Admin_Orders: React.FC = () => {
  const [adminUid, setAdminUid] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Get orders for the admin
  const orders = useQuery(
    api.orders.getOrdersByAdmin,
    adminUid ? { adminUid } : "skip"
  );

  const updateOrderStatus = useMutation(api.orders.updateOrderStatus);
  const deleteOrder = useMutation(api.orders.deleteOrder);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAdminUid(user.uid);
        setAdminEmail(user.email ?? null);
      } else {
        setAdminUid(null);
        setAdminEmail(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Send email notification via NodeMailer backend
  const sendOrderCompletedMail = async ({
    to,
    orderId,
    productName,
    sellerEmail,
  }: {
    to: string;
    orderId: string;
    productName: string;
    sellerEmail: string;
  }) => {
    try {
      await fetch("/api/sendOrderCompletionEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to,
          orderId,
          productName,
          sellerEmail,
        }),
      });
    } catch (error) {
      // Optionally log error or alert
    }
  };

  // Updated status update logic
  const handleStatusUpdate = async (
    orderId: Id<"orders">,
    newStatus: string,
    order: any // full order record
  ) => {
    try {
      await updateOrderStatus({ orderId, status: newStatus });
      alert(`Order status updated to ${newStatus}`);

      if (
        newStatus === "completed" &&
        adminEmail &&
        order.userEmail &&
        order.productName
      ) {
        // Send mail from current admin (seller) to customer
        await sendOrderCompletedMail({
          to: order.userEmail,
          orderId: order._id,
          productName: order.productName,
          sellerEmail: adminEmail,
        });
      }
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order status");
    }
  };

  const handleDeleteOrder = async (orderId: Id<"orders">) => {
    if (confirm("Are you sure you want to delete this order?")) {
      try {
        await deleteOrder({ orderId });
        alert("Order deleted successfully");
      } catch (error) {
        console.error("Error deleting order:", error);
        alert("Failed to delete order");
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredOrders = orders?.filter((order) =>
    selectedStatus === "all" ? true : order.status === selectedStatus
  );

  if (!adminUid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Please log in to view orders</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 mt-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-green-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                Order Management
              </h1>
            </div>
            <div className="text-sm text-gray-600">
              Total Orders: {orders?.length ?? 0}
            </div>
          </div>
          {/* Status Filter */}
          <div className="mt-6 flex gap-2 flex-wrap">
            {["all", "pending", "processing", "completed", "cancelled"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selectedStatus === status
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              )
            )}
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {!filteredOrders || filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-xl">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order._id.slice(-8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {order.productImage && (
                            <img
                              src={order.productImage}
                              alt={order.productName}
                              className="w-12 h-12 rounded object-cover"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.productName}
                            </div>
                            <div className="text-xs text-gray-500">
                              ₹{order.productPrice}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.userEmail}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.userId.slice(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        ₹{order.totalPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          {/* Status Update Dropdown */}
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusUpdate(
                                order._id,
                                e.target.value,
                                order
                              )
                            }
                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteOrder(order._id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                            title="Delete order"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          {["pending", "processing", "completed", "cancelled"].map((status) => {
            const count =
              orders?.filter((o) => o.status === status).length ?? 0;
            return (
              <div
                key={status}
                className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500"
              >
                <div className="text-sm text-gray-600 uppercase">
                  {status}
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Admin_Orders;
