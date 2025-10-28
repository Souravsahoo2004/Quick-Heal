// convex/cart.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Add to cart
export const addToCart = mutation({
  args: {
    userId: v.string(),
    productId: v.id("products"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const existingItem = await ctx.db
      .query("cart")
      .withIndex("by_user_product", (q) =>
        q.eq("userId", args.userId).eq("productId", args.productId)
      )
      .first();

    if (existingItem) {
      await ctx.db.patch(existingItem._id, {
        quantity: existingItem.quantity + args.quantity,
      });
      return existingItem._id;
    } else {
      const cartId = await ctx.db.insert("cart", {
        userId: args.userId,
        productId: args.productId,
        quantity: args.quantity,
        addedAt: Date.now(),
      });
      return cartId;
    }
  },
});

// ✅ Update cart quantity
export const updateCartQuantity = mutation({
  args: {
    userId: v.string(),
    productId: v.string(),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    // Find cart item by userId and productId string
    const cartItems = await ctx.db
      .query("cart")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    const cartItem = cartItems.find(item => item.productId === args.productId as any);

    if (cartItem) {
      await ctx.db.patch(cartItem._id, {
        quantity: args.quantity,
      });
    }
  },
});

// Get user cart
export const getUserCart = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const cartItems = await ctx.db
      .query("cart")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const enrichedCart = await Promise.all(
      cartItems.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        
        let imageUrls: string[] = [];
        if (product && product.imageStorageIds.length > 0) {
          imageUrls = await Promise.all(
            product.imageStorageIds.map(async (storageId) => {
              return (await ctx.storage.getUrl(storageId)) ?? "";
            })
          );
        }

        return {
          ...item,
          product: {
            ...product,
            imageUrls,
          },
        };
      })
    );

    return enrichedCart;
  },
});

// ✅ Remove from cart by productId string
export const removeFromCart = mutation({
  args: { 
    userId: v.string(),
    productId: v.string(),
  },
  handler: async (ctx, args) => {
    const cartItems = await ctx.db
      .query("cart")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    const cartItem = cartItems.find(item => item.productId === args.productId as any);

    if (cartItem) {
      await ctx.db.delete(cartItem._id);
    }
  },
});

// Clear cart
export const clearCart = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const cartItems = await ctx.db
      .query("cart")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    await Promise.all(
      cartItems.map((item) => ctx.db.delete(item._id))
    );
  },
});
