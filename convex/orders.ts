// convex/orders.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// ✅ Create order when user buys a product
export const createOrder = mutation({
  args: {
    userId: v.string(),
    userEmail: v.string(),
    productId: v.id("products"),
    quantity: v.number(),
    totalPrice: v.number(),
    shippingAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get product to find the admin who owns it
    const product = await ctx.db.get(args.productId);
    
    if (!product) {
      throw new Error("Product not found");
    }

    const orderId = await ctx.db.insert("orders", {
      userId: args.userId,
      userEmail: args.userEmail,
      productId: args.productId,
      adminUid: product.adminUid,
      quantity: args.quantity,
      totalPrice: args.totalPrice,
      status: "pending",
      shippingAddress: args.shippingAddress,
      orderDate: Date.now(),
    });

    return orderId;
  },
});

// ✅ Get orders for a specific user (NEW - for My Orders page)
export const getUserOrders = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Fetch all orders for the user
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    // Enrich orders with product details
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const product = await ctx.db.get(order.productId);
        
        // Get image URLs
        let imageUrls: string[] = [];
        if (product && product.imageStorageIds && product.imageStorageIds.length > 0) {
          imageUrls = await Promise.all(
            product.imageStorageIds.map(async (storageId) => {
              return (await ctx.storage.getUrl(storageId)) ?? "";
            })
          );
        }

        return {
          ...order,
          productName: product?.productName ?? "Product",
          productImage: imageUrls[0] ?? null,
          productPrice: product?.price ?? 0,
          productDescription: product?.description ?? "",
          adminEmail: product?.adminEmail ?? "",
        };
      })
    );

    return enrichedOrders;
  },
});

// ✅ Get all orders for a specific admin (for Admin Dashboard)
export const getOrdersByAdmin = query({
  args: { adminUid: v.string() },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_admin", (q) => q.eq("adminUid", args.adminUid))
      .order("desc")
      .collect();

    // Enrich orders with product details
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const product = await ctx.db.get(order.productId);
        
        // Get image URLs
        let imageUrls: string[] = [];
        if (product && product.imageStorageIds && product.imageStorageIds.length > 0) {
          imageUrls = await Promise.all(
            product.imageStorageIds.map(async (storageId) => {
              return (await ctx.storage.getUrl(storageId)) ?? "";
            })
          );
        }

        return {
          ...order,
          productName: product?.productName ?? "Unknown Product",
          productImage: imageUrls[0] ?? null,
          productPrice: product?.price ?? 0,
          productDescription: product?.description ?? "",
        };
      })
    );

    return enrichedOrders;
  },
});

// ✅ Get a single order by ID
export const getOrderById = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    
    if (!order) {
      return null;
    }

    // Get product details
    const product = await ctx.db.get(order.productId);
    
    // Get image URLs
    let imageUrls: string[] = [];
    if (product && product.imageStorageIds && product.imageStorageIds.length > 0) {
      imageUrls = await Promise.all(
        product.imageStorageIds.map(async (storageId) => {
          return (await ctx.storage.getUrl(storageId)) ?? "";
        })
      );
    }

    return {
      ...order,
      productName: product?.productName ?? "Product",
      productImage: imageUrls[0] ?? null,
      productPrice: product?.price ?? 0,
      productDescription: product?.description ?? "",
      productImages: imageUrls,
    };
  },
});

// ✅ Get order statistics for a user
export const getUserOrderStats = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    
    const statusCounts = {
      pending: orders.filter(o => o.status === "pending").length,
      processing: orders.filter(o => o.status === "processing").length,
      completed: orders.filter(o => o.status === "completed").length,
      cancelled: orders.filter(o => o.status === "cancelled").length,
    };

    return {
      totalOrders,
      totalSpent,
      statusCounts,
    };
  },
});

// ✅ Get order statistics for an admin
export const getAdminOrderStats = query({
  args: { adminUid: v.string() },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_admin", (q) => q.eq("adminUid", args.adminUid))
      .collect();

    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter(o => o.status !== "cancelled")
      .reduce((sum, order) => sum + order.totalPrice, 0);
    
    const statusCounts = {
      pending: orders.filter(o => o.status === "pending").length,
      processing: orders.filter(o => o.status === "processing").length,
      completed: orders.filter(o => o.status === "completed").length,
      cancelled: orders.filter(o => o.status === "cancelled").length,
    };

    return {
      totalOrders,
      totalRevenue,
      statusCounts,
    };
  },
});

// ✅ Update order status
export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.orderId, {
      status: args.status,
    });
  },
});

// ✅ Cancel order (user can only cancel pending orders)
export const cancelOrder = mutation({
  args: { 
    orderId: v.id("orders"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    
    if (!order) {
      throw new Error("Order not found");
    }

    // Check if user owns the order
    if (order.userId !== args.userId) {
      throw new Error("Unauthorized to cancel this order");
    }

    // Only allow cancellation of pending orders
    if (order.status !== "pending") {
      throw new Error("Only pending orders can be cancelled");
    }

    await ctx.db.patch(args.orderId, {
      status: "cancelled",
    });

    return { success: true };
  },
});

// ✅ Delete order
export const deleteOrder = mutation({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.orderId);
  },
});

// ✅ Get recent orders (for dashboard/analytics)
export const getRecentOrders = query({
  args: { 
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    
    const orders = await ctx.db
      .query("orders")
      .order("desc")
      .take(limit);

    // Enrich with product details
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const product = await ctx.db.get(order.productId);
        
        let imageUrls: string[] = [];
        if (product && product.imageStorageIds && product.imageStorageIds.length > 0) {
          imageUrls = await Promise.all(
            product.imageStorageIds.map(async (storageId) => {
              return (await ctx.storage.getUrl(storageId)) ?? "";
            })
          );
        }

        return {
          ...order,
          productName: product?.productName ?? "Product",
          productImage: imageUrls[0] ?? null,
        };
      })
    );

    return enrichedOrders;
  },
});

// ✅ Search orders by status
export const getOrdersByStatus = query({
  args: { 
    status: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let orders = await ctx.db
      .query("orders")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .collect();

    // Filter by userId if provided
    if (args.userId) {
      orders = orders.filter(order => order.userId === args.userId);
    }

    // Enrich with product details
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const product = await ctx.db.get(order.productId);
        
        let imageUrls: string[] = [];
        if (product && product.imageStorageIds && product.imageStorageIds.length > 0) {
          imageUrls = await Promise.all(
            product.imageStorageIds.map(async (storageId) => {
              return (await ctx.storage.getUrl(storageId)) ?? "";
            })
          );
        }

        return {
          ...order,
          productName: product?.productName ?? "Product",
          productImage: imageUrls[0] ?? null,
          productPrice: product?.price ?? 0,
        };
      })
    );

    return enrichedOrders;
  },
});
