import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create or update user in Convex
export const createOrUpdateUser = mutation({
  args: {
    uid: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    gender: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("uid"), args.uid))
      .first();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        gender: args.gender,
      });
      return existingUser._id;
    } else {
      return await ctx.db.insert("users", {
        uid: args.uid,
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        gender: args.gender,
      });
    }
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const updateProfilePicture = mutation({
  args: {
    storageId: v.id("_storage"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
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

export const updateUserProfile = mutation({
  args: {
    userId: v.string(),
    firstName: v.string(),
    lastName: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("uid"), args.userId))
      .first();

    if (user) {
      await ctx.db.patch(user._id, {
        firstName: args.firstName,
        lastName: args.lastName,
      });
    }
  },
});

export const getUserByUid = query({
  args: { uid: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
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
