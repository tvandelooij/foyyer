import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { DataModel } from "./_generated/dataModel";
import { components } from "./_generated/api";
import { TableAggregate } from "@convex-dev/aggregate";

const randomize = new TableAggregate<{
  DataModel: DataModel;
  TableName: "productions";
  Key: string;
}>(components.productions, { sortKey: (doc) => doc.start_date });

export const getUpcomingPremieres = query({
  args: {},
  handler: async (ctx) => {
    const productions = await ctx.db
      .query("productions")
      .withIndex("by_start_date", (q) =>
        q.gt("start_date", new Date(Date.now()).toISOString()),
      )
      .order("asc")
      .take(10);
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

export const updateProductionStats = mutation({
  args: {
    id: v.id("productions"),
    avg_rating: v.float64(),
    rating_count: v.number(),
    review_count: v.number(),
  },
  handler: async (ctx, args) => {
    const production = await ctx.db.get(args.id);
    if (!production) {
      throw new Error("Production not found");
    }
    await ctx.db.patch(args.id, {
      avg_rating: args.avg_rating,
      rating_count: args.rating_count,
      review_count: args.review_count,
    });
  },
});

export const getRandomProductionsForCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    const productions = await ctx.db
      .query("productions")
      .withIndex("by_discipline_by_date", (q) =>
        q
          .eq("discipline", args.category)
          .gt("start_date", new Date(Date.now()).toISOString()),
      )
      .order("asc")
      .take(10);
    return productions;
  },
});
