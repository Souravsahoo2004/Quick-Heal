import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all addresses for a user
export const getUserAddresses = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const addresses = await ctx.db
      .query("addresses")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return addresses.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Add new address
export const addAddress = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    phone: v.string(),
    addressLine1: v.string(),
    addressLine2: v.optional(v.string()),
    city: v.string(),
    state: v.string(),
    pincode: v.string(),
    isDefault: v.boolean(),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Determine location type based on presence of coordinates
    const locationType = args.latitude && args.longitude ? "auto" : "manual";

    // If this address is set as default, unset all other defaults
    if (args.isDefault) {
      const existingAddresses = await ctx.db
        .query("addresses")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .collect();

      for (const addr of existingAddresses) {
        if (addr.isDefault) {
          await ctx.db.patch(addr._id, { isDefault: false });
        }
      }
    }

    const addressId = await ctx.db.insert("addresses", {
      userId: args.userId,
      name: args.name,
      phone: args.phone,
      addressLine1: args.addressLine1,
      addressLine2: args.addressLine2,
      city: args.city,
      state: args.state,
      pincode: args.pincode,
      isDefault: args.isDefault,
      latitude: args.latitude,
      longitude: args.longitude,
      locationType,
      createdAt: Date.now(),
    });

    return addressId;
  },
});

// Delete address
export const deleteAddress = mutation({
  args: { addressId: v.id("addresses") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.addressId);
  },
});

// Set default address
export const setDefaultAddress = mutation({
  args: {
    addressId: v.id("addresses"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // Unset all defaults for this user
    const addresses = await ctx.db
      .query("addresses")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    for (const addr of addresses) {
      await ctx.db.patch(addr._id, {
        isDefault: addr._id === args.addressId,
      });
    }
  },
});

// Get single address by ID
export const getAddressById = query({
  args: { addressId: v.id("addresses") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.addressId);
  },
});
