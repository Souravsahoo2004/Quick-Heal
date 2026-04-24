import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/* =========================
   CREATE DOCTOR (ONLY 1 PER USER)
========================= */
export const saveDoctorImages = mutation({
  args: {
    doctorId: v.string(),
    userId: v.string(), // ✅ important
    email: v.string(),

    name: v.string(),
    specialization: v.string(),
    location: v.string(),

    doctorImageIds: v.array(v.id("_storage")),
    locationImageIds: v.array(v.id("_storage")),

    fees: v.number(),
    description: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    // 🚫 Restrict: only 1 doctor per user
    const existing = await ctx.db
      .query("doctors")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (existing) {
      throw new Error("Doctor already exists for this user");
    }

    await ctx.db.insert("doctors", {
      ...args,
      description: args.description || "",

      totalRating: 0,
      reviews: 0,
      rating: 0,
    });
  },
});

/* =========================
   GET DOCTOR BY USER (🔥 IMPORTANT)
========================= */
export const getDoctorByUserId = query({
  args: { userId: v.string() },

  handler: async (ctx, args) => {
    const doctor = await ctx.db
      .query("doctors")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .first();

    if (!doctor) return null;

     const doctorImages = await Promise.all(
      (doctor.doctorImageIds || []).map((id) =>
        ctx.storage.getUrl(id)
      )
    );

    const locationImages = await Promise.all(
      (doctor.locationImageIds || []).map((id) =>
        ctx.storage.getUrl(id)
      )
    );

    return {
      ...doctor,
      doctorImages,
      locationImages,
    };
  },
});

/* =========================
   GET ALL DOCTORS
========================= */
export const getDoctors = query({
  handler: async (ctx) => {
    const doctors = await ctx.db.query("doctors").collect();

    return Promise.all(
      doctors.map(async (doc) => {
        const imageUrl = doc.doctorImageIds?.[0]
          ? await ctx.storage.getUrl(doc.doctorImageIds[0])
          : null;

        const locationImageUrl = doc.locationImageIds?.[0]
          ? await ctx.storage.getUrl(doc.locationImageIds[0])
          : null;

        return {
          ...doc,
          imageUrl,
          locationImageUrl,
        };
      })
    );
  },
});

/* =========================
   GET SINGLE DOCTOR
========================= */
export const getDoctorById = query({
  args: { id: v.id("doctors") },

  handler: async (ctx, args) => {
    const doctor = await ctx.db.get(args.id);
    if (!doctor) return null;

    const doctorImages = (
  await Promise.all(
    (doctor.doctorImageIds || []).map((id) =>
      ctx.storage.getUrl(id)
    )
  )
).filter((img): img is string => !!img);

    const locationImages = await Promise.all(
      (doctor.locationImageIds || []).map((id) =>
        ctx.storage.getUrl(id)
      )
    );

    return {
      ...doctor,
      doctorImages,
      locationImages,
    };
  },
});
/* =========================
   UPDATE DOCTOR
========================= */
export const updateDoctor = mutation({
  args: {
    id: v.id("doctors"),

    name: v.string(),
    specialization: v.string(),
    location: v.string(),
    fees: v.number(),
    description: v.string(),
  },

  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    await ctx.db.patch(id, rest);
  },
});

/* =========================
   DELETE DOCTOR
========================= */
export const deleteDoctor = mutation({
  args: { id: v.id("doctors") },

  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

/* =========================
   RATE + REVIEW DOCTOR
========================= */
export const rateDoctor = mutation({
  args: {
    doctorId: v.id("doctors"),
    userId: v.string(),
    rating: v.number(),
    review: v.string(),
  },

  handler: async (ctx, args) => {
    const doctor = await ctx.db.get(args.doctorId);
    if (!doctor) throw new Error("Doctor not found");

    // check if user already rated
    const existing = await ctx.db
      .query("ratings")
      .withIndex("by_user_doctor", (q) =>
        q.eq("userId", args.userId).eq("doctorId", args.doctorId)
      )
      .unique();

    if (existing) {
      // update
      await ctx.db.patch(existing._id, {
        rating: args.rating,
        review: args.review,
        createdAt: Date.now(),
      });
    } else {
      // insert
      await ctx.db.insert("ratings", {
        doctorId: args.doctorId,
        userId: args.userId,
        rating: args.rating,
        review: args.review,
        createdAt: Date.now(),
      });
    }

    // recalc
    const allRatings = await ctx.db
      .query("ratings")
      .withIndex("by_doctor", (q) => q.eq("doctorId", args.doctorId))
      .collect();

    const total = allRatings.reduce((sum, r) => sum + r.rating, 0);
    const avg = total / allRatings.length;

    await ctx.db.patch(args.doctorId, {
      totalRating: total,
      reviews: allRatings.length,
      rating: Number(avg.toFixed(1)),
    });
  },
});

/* =========================
   GET REVIEWS
========================= */
export const getDoctorReviews = query({
  args: { doctorId: v.id("doctors") },

  handler: async (ctx, args) => {
    return await ctx.db
      .query("ratings")
      .withIndex("by_doctor", (q) => q.eq("doctorId", args.doctorId))
      .order("desc")
      .collect();
  },
});