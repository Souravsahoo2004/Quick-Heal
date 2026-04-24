import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/* =========================
   CREATE DOCTOR
========================= */
export const saveDoctorImages = mutation({
  args: {
    doctorId: v.string(),
    email: v.string(),

    name: v.string(),
    specialization: v.string(),
    location: v.string(),

    doctorImageIds: v.array(v.id("_storage")),
    locationImageIds: v.array(v.id("_storage")),

    fees: v.number(),

    description: v.optional(v.string()), // ✅ added
  },

  handler: async (ctx, args) => {
    await ctx.db.insert("doctors", {
      doctorId: args.doctorId,
      email: args.email,

      name: args.name,
      specialization: args.specialization,
      location: args.location,

      doctorImageIds: args.doctorImageIds,
      locationImageIds: args.locationImageIds,

      fees: args.fees,

      description: args.description || "", // ✅ store description

      // auto values
      totalRating: 0,
      reviews: 0,
      rating: 0,
    });
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
        const doctorImageUrl = doc.doctorImageIds?.[0]
          ? await ctx.storage.getUrl(doc.doctorImageIds[0])
          : null;

        const locationImageUrl = doc.locationImageIds?.[0]
          ? await ctx.storage.getUrl(doc.locationImageIds[0])
          : null;

        return {
          ...doc,
          imageUrl: doctorImageUrl,
          locationImageUrl: locationImageUrl,
        };
      })
    );
  },
});

/* =========================
   GET SINGLE DOCTOR
========================= */
export const getDoctorById = query({
  args: {
    id: v.id("doctors"),
  },

  handler: async (ctx, args) => {
    const doctor = await ctx.db.get(args.id);
    if (!doctor) return null;

    const imageUrl = doctor.doctorImageIds?.[0]
      ? await ctx.storage.getUrl(doctor.doctorImageIds[0])
      : null;

    const locationImageUrl = doctor.locationImageIds?.[0]
      ? await ctx.storage.getUrl(doctor.locationImageIds[0])
      : null;

    return {
      ...doctor,
      imageUrl,
      locationImageUrl,
    };
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
      // update existing
      await ctx.db.patch(existing._id, {
        rating: args.rating,
        review: args.review,
        createdAt: Date.now(),
      });
    } else {
      // insert new
      await ctx.db.insert("ratings", {
        doctorId: args.doctorId,
        userId: args.userId,
        rating: args.rating,
        review: args.review,
        createdAt: Date.now(),
      });
    }

    // recalculate rating
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
  args: {
    doctorId: v.id("doctors"),
  },

  handler: async (ctx, args) => {
    return await ctx.db
      .query("ratings")
      .withIndex("by_doctor", (q) => q.eq("doctorId", args.doctorId))
      .order("desc")
      .collect();
  },
});