import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const saveDoctorImages = mutation({
  args: {
    doctorId: v.string(),
    email: v.string(),

    name: v.string(),
    specialization: v.string(),
    location: v.string(),

    doctorImageIds: v.array(v.id("_storage")),
    locationImageIds: v.array(v.id("_storage")),

    rating: v.number(),
    reviews: v.number(),
    fees: v.number(),
  },

  handler: async (ctx, args) => {
   await ctx.db.insert("doctors", {
  ...args,
  totalRating: 0,   // 🔥 NEW
  reviews: 0,
  rating: 0,
});
  },
});

export const getDoctors = query({
  handler: async (ctx) => {
    const doctors = await ctx.db.query("doctors").collect();

    return Promise.all(
      doctors.map(async (doc) => {
        const doctorImageUrl = doc.doctorImageIds[0]
          ? await ctx.storage.getUrl(doc.doctorImageIds[0])
          : null;

        const locationImageUrl = doc.locationImageIds[0]
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



export const rateDoctor = mutation({
  args: {
    doctorId: v.id("doctors"),
    userId: v.string(),
    rating: v.number(),
    review: v.string(),
  },

  handler: async (ctx, args) => {
    // 🔥 Find doctor
   const doctor = await ctx.db.get(args.doctorId);

    if (!doctor) throw new Error("Doctor not found");

    // 🔥 Check if user already rated
    const existing = await ctx.db
      .query("ratings")
      .filter((q) =>
        q.and(
          q.eq(q.field("doctorId"), args.doctorId),
          q.eq(q.field("userId"), args.userId)
        )
      )
      .first();

    if (existing) {
      throw new Error("You already rated this doctor");
    }

    // 🔥 Save rating separately
    await ctx.db.insert("ratings", {
      doctorId: args.doctorId,
      userId: args.userId,
      rating: args.rating,
      review: args.review,
      createdAt: Date.now(),
    });

    // 🔥 Update doctor stats
    const newTotal = (doctor.totalRating || 0) + args.rating;
    const newReviews = (doctor.reviews || 0) + 1;
    const avg = newTotal / newReviews;

    await ctx.db.patch(doctor._id, {
      totalRating: newTotal,
      reviews: newReviews,
      rating: Number(avg.toFixed(1)), // 4.3 format
    });
  },
});