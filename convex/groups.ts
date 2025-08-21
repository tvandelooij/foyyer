import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listGroupsCreatedByUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const groups = await ctx.db
      .query("groups")
      .filter((q) => q.eq(q.field("createdBy"), identity.subject))
      .collect();

    return groups;
  },
});

export const createGroup = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    visibility: v.union(v.literal("public"), v.literal("private")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();

    return ctx.db.insert("groups", {
      name: args.name,
      description: args.description,
      visibility: args.visibility,
      createdBy: identity.subject,
      createdAt: now,
      updatedAt: now,
    });
  },
});
