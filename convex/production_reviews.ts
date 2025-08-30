import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const createReview = mutation({
  args: {
    productionId: v.id("productions"),
    userId: v.string(),
    visited: v.boolean(),
    rating: v.optional(v.number()),
    review: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Implement the logic to create a review
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("User not authenticated");
    }

    const { productionId, visited, rating, review } = args;

    // Create the review in the database
    return await ctx.db.insert("productionReviews", {
      productionId,
      userId: identity.subject,
      visited,
      rating,
      review,
      updatedAt: Date.now(),
    });
  },
});

export const updateRating = mutation({
  args: {
    id: v.id("productionReviews"),
    rating: v.optional(v.number()),
    visited: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      rating: args.rating,
      visited: args.visited,
      updatedAt: Date.now(),
    });
  },
});

export const updateReview = mutation({
  args: {
    id: v.id("productionReviews"),
    review: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      review: args.review,
      updatedAt: Date.now(),
    });
  },
});

export const getReviewsForProductionByUser = query({
  args: { productionId: v.id("productions"), userId: v.string() },
  handler: async (ctx, args) => {
    // Fetch the reviews from the database
    return await ctx.db
      .query("productionReviews")
      .withIndex("by_production_user", (q) =>
        q.eq("productionId", args.productionId).eq("userId", args.userId),
      )
      .first();
  },
});

export const getReviewsForProduction = query({
  args: { productionId: v.id("productions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("productionReviews")
      .withIndex("by_production", (q) =>
        q.eq("productionId", args.productionId),
      )
      .order("desc")
      .take(5);
  },
});

export const getAllReviewsByUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("productionReviews")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});
