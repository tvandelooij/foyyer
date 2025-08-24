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

export const getAgendaItem = query({
  args: { id: v.id("userAgenda") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("userId is required to get agenda item.");
    }

    const item = await ctx.db.get(args.id);

    if (item?.userId !== identity.subject) {
      throw new Error("You do not have permission to access this agenda item.");
    }

    return item;
  },
});

export const getAgendaItemsForGroup = query({
  args: { groupId: v.id("groups"), productionId: v.id("productions") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("userAgenda")
      .filter((q) =>
        q.and(
          q.eq(q.field("groupId"), args.groupId),
          q.eq(q.field("productionId"), args.productionId),
        ),
      )
      .collect();
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

export const listAgendaItemsForUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("userId is required to list agenda items.");
    }

    return ctx.db
      .query("userAgenda")
      .withIndex("by_date")
      .order("asc")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), identity.subject),
          q.gt(q.field("date"), new Date(Date.now()).toISOString()),
        ),
      )
      .collect();
  },
});
