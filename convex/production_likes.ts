import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const likeProduction = mutation({
  args: { productionId: v.id("productions") },
  handler: async (ctx, { productionId }) => {
    const identity = await ctx.auth.getUserIdentity();
    await ctx.db.insert("production_likes", {
      production_id: productionId,
      user_id: identity?.subject as string,
    });
  },
});

export const unlikeProduction = mutation({
  args: { productionId: v.id("productions") },
  handler: async (ctx, { productionId }) => {
    const identity = await ctx.auth.getUserIdentity();
    const like = await ctx.db
      .query("production_likes")
      .withIndex("by_user_production", (q) =>
        q
          .eq("user_id", identity?.subject as string)
          .eq("production_id", productionId),
      )
      .first();
    if (like) {
      await ctx.db.delete(like._id);
    }
  },
});

export const hasLikedProduction = query({
  args: { productionId: v.id("productions") },
  handler: async (ctx, { productionId }) => {
    const identity = await ctx.auth.getUserIdentity();

    const like = await ctx.db
      .query("production_likes")
      .withIndex("by_user_production", (q) =>
        q
          .eq("user_id", identity?.subject as string)
          .eq("production_id", productionId),
      )
      .first();
    return like !== null;
  },
});

export const getTopLikedProductionsForUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    const likes = await ctx.db
      .query("production_likes")
      .withIndex("by_user", (q) => q.eq("user_id", identity?.subject as string))
      .take(3);

    const productionIds = likes.map((like) => like.production_id);

    const productions = await Promise.all(
      productionIds.map((id) => ctx.db.get(id)),
    );

    return productions.filter(Boolean);
  },
});

export const getAllLikedProductions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    const likes = await ctx.db
      .query("production_likes")
      .withIndex("by_user", (q) => q.eq("user_id", identity?.subject as string))
      .order("asc")
      .collect();

    const productionIds = likes.map((like) => like.production_id);

    const productions = await Promise.all(
      productionIds.map((id) => ctx.db.get(id)),
    );

    return productions.filter(Boolean);
  },
});
