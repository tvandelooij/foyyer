import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listGroupsForUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("nickname"), identity.nickname))
      .first();

    if (!user) {
      throw new Error("User not found");
    }
  },
});
