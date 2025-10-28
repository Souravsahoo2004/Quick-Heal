import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    uid: v.string(),
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    gender: v.string(),
    photoStorageId: v.optional(v.id("_storage")),
  }).index("by_uid", ["uid"]),
  
  adminUsers: defineTable({
    uid: v.string(),
    email: v.string(),
    name: v.string(),
    photoStorageId: v.optional(v.id("_storage")),
  }).index("by_uid", ["uid"]),

  products: defineTable({
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
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_admin", ["adminUid"])
    .index("by_admin_email", ["adminEmail"]),
});
