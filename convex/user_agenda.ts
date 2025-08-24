import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createAgendaItem = mutation({
  args: {
    userId: v.optional(v.string()),
    productionId: v.id("productions"),
    venueId: v.id("venues"),
    date: v.string(),
    start_time: v.string(),
    status: v.union(
      v.literal("planned"),
      v.literal("confirmed"),
      v.literal("canceled"),
    ),
  },
  handler: async (ctx, args) => {
    let { userId, productionId, venueId, date, start_time, status } = args;

    if (userId === undefined) {
      const identify = await ctx.auth.getUserIdentity();
      userId = identify?.subject?.toString();
    }

    if (!userId) {
      throw new Error("userId is required to create an agenda item.");
    }

    await ctx.db.insert("userAgenda", {
      userId,
      productionId,
      venueId,
      date,
      start_time,
      status,
    });
  },
});

export const getAgendaForUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("userId is required to get agenda items.");
    }

    return ctx.db
      .query("userAgenda")
      .withIndex("by_date")
      .order("asc")
      .filter((q) => q.eq(q.field("userId"), identity.subject));
  },
});
