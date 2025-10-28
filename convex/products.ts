import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Generate upload URL for product images
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Create a new product
export const createProduct = mutation({
  args: {
    adminUid: v.string(),
    adminEmail: v.string(),
    productName: v.string(),
    description: v.string(),
    price: v.number(),
    discountedPrice: v.optional(v.number()),
    rating: v.optional(v.number()),
    offers: v.optional(v.string()),
    highlightedFeatures: v.array(v.string()),
    imageStorageIds: v.array(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    return await ctx.db.insert("products", {
      adminUid: args.adminUid,
      adminEmail: args.adminEmail,
      productName: args.productName,
      description: args.description,
      price: args.price,
      discountedPrice: args.discountedPrice,
      rating: args.rating,
      offers: args.offers,
      highlightedFeatures: args.highlightedFeatures,
      imageStorageIds: args.imageStorageIds,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update an existing product
export const updateProduct = mutation({
  args: {
    productId: v.id("products"),
    productName: v.string(),
    description: v.string(),
    price: v.number(),
    discountedPrice: v.optional(v.number()),
    rating: v.optional(v.number()),
    offers: v.optional(v.string()),
    highlightedFeatures: v.array(v.string()),
    imageStorageIds: v.array(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const { productId, ...updates } = args;
    
    await ctx.db.patch(productId, {
      ...updates,
      updatedAt: Date.now(),
    });
    
    return productId;
  },
});

// Delete a product
export const deleteProduct = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.productId);
  },
});

// Get all products by admin
export const getProductsByAdmin = query({
  args: { adminUid: v.string() },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .filter((q) => q.eq(q.field("adminUid"), args.adminUid))
      .order("desc")
      .collect();

    // Get image URLs for all products
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const imageUrls = await Promise.all(
          product.imageStorageIds.map((id) => ctx.storage.getUrl(id))
        );
        return {
          ...product,
          imageUrls: imageUrls.filter((url): url is string => url !== null),
        };
      })
    );

    return productsWithImages;
  },
});

// Get a single product by ID
export const getProductById = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    
    if (!product) return null;

    const imageUrls = await Promise.all(
      product.imageStorageIds.map((id) => ctx.storage.getUrl(id))
    );

    return {
      ...product,
      imageUrls: imageUrls.filter((url): url is string => url !== null),
    };
  },
});

// Get all products (for public view)
export const getAllProducts = query({
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .order("desc")
      .collect();

    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const imageUrls = await Promise.all(
          product.imageStorageIds.map((id) => ctx.storage.getUrl(id))
        );
        return {
          ...product,
          imageUrls: imageUrls.filter((url): url is string => url !== null),
        };
      })
    );

    return productsWithImages;
  },
});
