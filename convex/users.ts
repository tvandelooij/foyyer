import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error("Not authenticated");
    }

    if (!identity.nickname || !identity.email) {
      throw new Error("User identity is missing nickname or email");
    }

    const userId = identity.subject;
    const maybeUser = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (maybeUser) {
      return maybeUser;
    }

    const user = {
      userId: identity.subject,
      nickname: identity.nickname,
      email: identity.email,
      pictureUrl: identity.pictureUrl?.toString(),
      updatedAt: Date.now(),
    };

    const id = await ctx.db.insert("users", user);
    return id;
  },
});

export const getUserById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.id))
      .first();
  },
});

export const getUsers = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    return ctx.db
      .query("users")
      .withSearchIndex("search_nickname", (q) =>
        q.search("nickname", args.query),
      )
      .filter((q) => q.neq(q.field("userId"), identity?.subject))
      .collect();
  },
});

export const getTotalVisitCountForUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const visitCount = await ctx.db
      .query("productionReviews")
      .withIndex("by_user_by_status", (q) =>
        q.eq("userId", args.userId).eq("visited", true),
      )
      .collect();

    return visitCount.length;
  },
});
