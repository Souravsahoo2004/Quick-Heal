"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, MapPin, FileText, Truck } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface ConvexAddress {
  _id: Id<"addresses">;
  _creationTime: number;
  userId: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  latitude?: number;
  longitude?: number;
  locationType?: "manual" | "auto";
  createdAt: number;
}

export default function OrderPage() {
  const { cartItems, getSubtotal, clearCart } = useCart();
  const router = useRouter();

  const [selectedAddressId, setSelectedAddressId] = useState<Id<"addresses"> | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // ✅ Convex queries and mutations
  const selectedAddress = useQuery(
    api.addresses.getAddressById,
    selectedAddressId ? { addressId: selectedAddressId } : "skip"
  ) as ConvexAddress | undefined | null;

  const createOrder = useMutation(api.orders.createOrder);

  const subtotal = getSubtotal();
  const delivery = 30;
  const total = subtotal + delivery;

  // Firebase auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setUserEmail(user.email);
      } else {
        setUserId(null);
        setUserEmail(null);
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Load selected address ID from localStorage
  useEffect(() => {
    try {
      const addressId = localStorage.getItem("selectedAddressId");

      if (!addressId) {
        console.log("No address ID found in localStorage");
        router.push("/Checkout");
        return;
      }

      console.log("Loading address ID:", addressId);
      setSelectedAddressId(addressId as Id<"addresses">);
    } catch (error) {
      console.error("Error loading address ID:", error);
      router.push("/Checkout");
    }
  }, [router]);

  // ✅ FIX: Check if address query returned null (not found) - only after query has completed
  useEffect(() => {
    // selectedAddress will be:
    // - undefined while loading
    // - null if not found
    // - ConvexAddress object if found
    
    if (selectedAddressId && selectedAddress === null) {
      console.error("Address not found in Convex - redirecting to Checkout");
      alert("Selected address not found. Please select an address again.");
      router.push("/Checkout");
    }
  }, [selectedAddressId, selectedAddress, router]);

  const handlePlaceOrder = async () => {
    try {
      setIsPlacingOrder(true);
      
      if (!selectedAddress || !userId || !userEmail) {
        throw new Error("Missing required information");
      }

      // ✅ Build full address string from Convex address
      const fullAddress = `${selectedAddress.addressLine1}${
        selectedAddress.addressLine2 ? ', ' + selectedAddress.addressLine2 : ''
      }, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`;

      // ✅ Create orders in Convex for items that have productId
      const orderPromises = cartItems
        .filter(item => item.productId) // Only process items with Convex product ID
        .map((item) => 
          createOrder({
            userId,
            userEmail,
            productId: item.productId as any,
            quantity: item.qty,
            totalPrice: item.price * item.qty,
            shippingAddress: fullAddress,
          })
        );

      if (orderPromises.length === 0) {
        throw new Error("No valid items to order");
      }

      const orderIds = await Promise.all(orderPromises);
      console.log(`✅ Created ${orderPromises.length} orders in Convex`);

      // ✅ Generate order number from first order ID
      const orderNumber = `#QH${orderIds[0].toString().slice(-6).toUpperCase()}`;

      // ✅ Calculate dates
      const orderDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      
      const expectedDeliveryDate = new Date();
      expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 2);
      const expectedDelivery = expectedDeliveryDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      // ✅ Send confirmation emails to BOTH customer and admin
      console.log("📧 Sending order confirmation emails...");
      
      try {
        const emailResponse = await fetch("/api/send-order-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // Customer info
            customerEmail: userEmail,
            customerName: selectedAddress.name,
            
            // Order details
            orderNumber: orderNumber,
            orderDate: orderDate,
            expectedDelivery: expectedDelivery,
            
            // Items
            items: cartItems.map(item => ({
              id: item.id,
              name: item.name,
              price: item.price,
              qty: item.qty,
              img: item.img,
            })),
            
            // Address - convert Convex address to expected format
            address: {
              id: selectedAddress._id,
              name: selectedAddress.name,
              phone: selectedAddress.phone,
              addressLine1: selectedAddress.addressLine1,
              addressLine2: selectedAddress.addressLine2,
              city: selectedAddress.city,
              state: selectedAddress.state,
              pincode: selectedAddress.pincode,
              isDefault: selectedAddress.isDefault,
            },
            
            // Pricing
            subtotal: subtotal,
            delivery: delivery,
            total: total,
            
            // Location data (optional)
            locationData: selectedAddress.latitude && selectedAddress.longitude ? {
              latitude: selectedAddress.latitude,
              longitude: selectedAddress.longitude,
              locationType: selectedAddress.locationType,
            } : undefined,
          }),
        });

        const emailResult = await emailResponse.json();

        if (emailResult.success) {
          console.log("✅ Emails sent successfully!");
          console.log("Customer email:", emailResult.data.customer.email);
          console.log("Admin email:", emailResult.data.admin.email);
        } else {
          console.error("❌ Failed to send emails:", emailResult.details);
          // Don't throw error - order is already placed
        }
      } catch (emailError) {
        console.error("Email error (non-critical):", emailError);
        // Don't fail the order if email fails
      }

      // Clear cart after successful order
      await clearCart();

      // Clear selected address from localStorage
      localStorage.removeItem("selectedAddressId");

      alert(
        `Order placed successfully! 🎉\n\n` +
        `Order Number: ${orderNumber}\n\n` +
        `✅ Confirmation email sent to: ${userEmail}\n` +
        `✅ Admin has been notified`
      );
      
      router.push("/my-Orders");

    } catch (e: any) {
      console.error("Error placing order:", e);
      alert(e.message || "Failed to place order");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // ✅ FIX: Show loading only when we have an address ID but address is still undefined (loading)
  const isLoadingAddress = selectedAddressId !== null && selectedAddress === undefined;

  if (isLoadingAddress) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full"></div>
        <p className="mt-3 text-gray-600">Loading order details...</p>
      </div>
    );
  }

  // If no address ID or address not found, don't render (will redirect)
  if (!selectedAddressId || !selectedAddress) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full"></div>
        <p className="mt-3 text-gray-600">Redirecting...</p>
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
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
              Ready to Place
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Items Section */}
          <div>
            <h3 className="font-medium text-gray-800 border-b pb-2">Items</h3>
            {cartItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="mx-auto mb-2 text-gray-400" size={40} />
                <p>No items in cart</p>
              </div>
            ) : (
              cartItems.map((item, i) => (
                <div key={item.id || i} className="flex justify-between py-4 border-b last:border-none">
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
              ))
            )}
          </div>

          {/* Delivery Address Section */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex justify-between items-start mb-2">
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-blue-500 mt-1" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{selectedAddress.name}</p>
                    {selectedAddress.locationType && (
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        selectedAddress.locationType === 'auto' 
                          ? 'bg-purple-100 text-purple-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {selectedAddress.locationType === 'auto' ? '📍 GPS' : '✏️ Manual'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{selectedAddress.phone}</p>
                  <p className="text-sm text-gray-600">
                    {selectedAddress.addressLine1}
                    {selectedAddress.addressLine2 && `, ${selectedAddress.addressLine2}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                  </p>
                  {selectedAddress.latitude && selectedAddress.longitude && (
                    <p className="text-xs text-gray-400 mt-1">
                      📍 Coordinates: {selectedAddress.latitude.toFixed(4)}, {selectedAddress.longitude.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/Checkout")}
                className="text-blue-600"
                disabled={isPlacingOrder}
              >
                Change
              </Button>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-3">
              <Truck className="w-3 h-3" />
              Expected Delivery:{" "}
              <span className="font-semibold text-green-600">
                {new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </p>
          </div>

          {/* Price Summary Section */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="font-medium text-gray-800 mb-3">Price Summary</h3>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Delivery Fee</span>
              <span>₹{delivery.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-800 text-lg mt-3 pt-3 border-t">
              <span>Total</span>
              <span className="text-green-600">₹{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Email Notification Info */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700 text-center">
              📧 Order confirmation will be sent to <strong>{userEmail}</strong>
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 mt-4 pt-6 border-t">
          <Button
            variant="outline"
            className="flex items-center gap-2 w-full sm:w-auto"
            onClick={() => router.push("/Cart")}
            disabled={isPlacingOrder}
          >
            <FileText size={18} />
            Back to Cart
          </Button>
          <Button
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto px-8 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder || cartItems.length === 0}
          >
            {isPlacingOrder ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Placing Order...
              </>
            ) : cartItems.length === 0 ? (
              <>
                <Package size={18} />
                Cart is Empty
              </>
            ) : (
              <>
                <Package size={18} />
                Place Order (₹{total.toFixed(2)})
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
