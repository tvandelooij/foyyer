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
      .filter((q) =>
        q.and(
          q.eq(q.field("production_id"), productionId),
          q.eq(q.field("user_id"), identity?.subject as string),
        ),
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
      .filter((q) =>
        q.and(
          q.eq(q.field("production_id"), productionId),
          q.eq(q.field("user_id"), identity?.subject as string),
        ),
      )
      .first();
    return like !== null;
  },
});

export const getLikedProductionsForUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    const likes = await ctx.db
      .query("production_likes")
      .filter((q) => q.eq(q.field("user_id"), identity?.subject as string))
      .collect();

    const productionIds = new Set(likes.map((like) => like.production_id));

    return await ctx.db
      .query("productions")
      .collect()
      .then((productions) =>
        productions.filter((production) => productionIds.has(production._id)),
      );
  },
});
