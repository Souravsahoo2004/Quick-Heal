import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create or update admin user in Convex
export const createOrUpdateAdmin = mutation({
  args: {
    uid: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("adminUsers")
      .filter((q) => q.eq(q.field("uid"), args.uid))
      .first();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
      });
      return existingUser._id;
    } else {
      return await ctx.db.insert("adminUsers", {
        uid: args.uid,
        email: args.email,
        name: args.name,
      });
    }
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const updateAdminProfilePicture = mutation({
  args: {
    storageId: v.id("_storage"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("adminUsers")
      .filter((q) => q.eq(q.field("uid"), args.userId))
      .first();

    if (user) {
      await ctx.db.patch(user._id, {
        photoStorageId: args.storageId,
      });
    }

    return args.storageId;
  },
});

export const updateAdminProfile = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("adminUsers")
      .filter((q) => q.eq(q.field("uid"), args.userId))
      .first();

    if (user) {
      await ctx.db.patch(user._id, {
        name: args.name,
      });
    }
  },
});

export const getAdminByUid = query({
  args: { uid: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("adminUsers")
      .filter((q) => q.eq(q.field("uid"), args.uid))
      .first();

    if (!user) return null;

    let photoURL = null;
    if (user.photoStorageId) {
      photoURL = await ctx.storage.getUrl(user.photoStorageId);
    }

    return {
      ...user,
      photoURL,
    };
  },
});
