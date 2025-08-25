import { query } from "./_generated/server";
import { v } from "convex/values";

export const getUpcomingPremieres = query({
  args: {},
  handler: async (ctx) => {
    const productions = await ctx.db
      .query("productions")
      .withIndex("by_start_date", (q) =>
        q.gt("start_date", new Date(Date.now()).toISOString()),
      )
      .order("asc")
      .take(5);
    return productions;
  },
});

export const getProductionById = query({
  args: { id: v.id("productions") },
  handler: async (ctx, args) => {
    const production = await ctx.db.get(args.id);
    if (!production) {
      throw new Error("Production not found");
    }
    return production;
  },
});
