import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const reactionTypes = v.union(
  v.literal("thumbs_up"),
  v.literal("thumbs_down"),
  v.literal("heart"),
  v.literal("smile"),
  v.literal("celebration"),
);

type ReactionType =
  | "thumbs_up"
  | "thumbs_down"
  | "heart"
  | "smile"
  | "celebration";

const defaultReactionCounts = {
  thumbs_up: 0,
  thumbs_down: 0,
  heart: 0,
  smile: 0,
  celebration: 0,
};

export const toggleReaction = mutation({
  args: {
    reviewId: v.id("productionReviews"),
    reactionType: reactionTypes,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User not authenticated");
    }

    const userId = identity.subject;
    const { reviewId, reactionType } = args;

    // Check if this reaction already exists
    const existingReaction = await ctx.db
      .query("reviewReactions")
      .withIndex("by_review_user_type", (q) =>
        q
          .eq("reviewId", reviewId)
          .eq("userId", userId)
          .eq("reactionType", reactionType),
      )
      .first();

    // Get the review
    const review = await ctx.db.get(reviewId);
    if (!review) {
      throw new Error("Review not found");
    }

    // Get current counts or initialize
    const currentCounts = review.reactionCounts ?? { ...defaultReactionCounts };

    if (existingReaction) {
      // Remove the reaction
      await ctx.db.delete(existingReaction._id);

      // Decrement count
      const newCounts = {
        ...currentCounts,
        [reactionType]: Math.max(0, currentCounts[reactionType] - 1),
      };

      await ctx.db.patch(reviewId, { reactionCounts: newCounts });

      return { action: "removed", reactionType };
    } else {
      // Add the reaction
      await ctx.db.insert("reviewReactions", {
        reviewId,
        userId,
        reactionType,
      });

      // Increment count
      const newCounts = {
        ...currentCounts,
        [reactionType]: currentCounts[reactionType] + 1,
      };

      await ctx.db.patch(reviewId, { reactionCounts: newCounts });

      // Create notification for review author (if not self)
      if (review.userId !== userId) {
        await ctx.db.insert("notifications", {
          userId: review.userId,
          type: "like_review",
          data: {
            senderId: userId,
            reviewId: reviewId,
            productionId: review.productionId,
            reactionType: reactionType,
          },
          read: false,
          createdAt: Date.now(),
        });
      }

      return { action: "added", reactionType };
    }
  },
});

export const getUserReactionsForReview = query({
  args: {
    reviewId: v.id("productionReviews"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const userId = identity.subject;

    // Get all reactions by this user for this review
    const reactions = await ctx.db
      .query("reviewReactions")
      .withIndex("by_review_user_type", (q) =>
        q.eq("reviewId", args.reviewId).eq("userId", userId),
      )
      .collect();

    return reactions.map((r) => r.reactionType);
  },
});
