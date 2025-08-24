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

export const updateAgendaItemStatus = mutation({
  args: {
    status: v.union(
      v.literal("planned"),
      v.literal("confirmed"),
      v.literal("canceled"),
    ),
    id: v.id("userAgenda"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("userId is required to update agenda item status.");
    }

    const item = await ctx.db.get(args.id);

    if (item?.userId !== identity.subject) {
      throw new Error("You do not have permission to update this agenda item.");
    }

    await ctx.db.patch(args.id, { status: args.status });
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

export const getAgendaItemForProduction = query({
  args: { id: v.id("productions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("userId is required to get agenda item.");
    }

    return ctx.db
      .query("userAgenda")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), identity.subject),
          q.eq(q.field("productionId"), args.id),
          // q.gt(q.field("date"), new Date(Date.now()).toISOString()),
        ),
      )
      .first();
  },
});

export const getEventProposal = query({
  args: { groupId: v.id("groups"), productionId: v.id("productions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("userId is required to get agenda items.");
    }

    return ctx.db
      .query("userAgenda")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), identity.subject),
          q.eq(q.field("groupId"), args.groupId),
          q.eq(q.field("productionId"), args.productionId),
        ),
      )
      .first();
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

export const deleteAgendaItem = mutation({
  args: { id: v.id("userAgenda") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("userId is required to delete agenda item.");
    }

    const item = await ctx.db.get(args.id);

    if (item?.userId !== identity.subject) {
      throw new Error("You do not have permission to delete this agenda item.");
    }

    await ctx.db.delete(args.id);
  },
});

export const updateAgendaItem = mutation({
  args: {
    _id: v.id("userAgenda"),
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("userId is required to update agenda item.");
    }

    const item = await ctx.db.get(args._id);
    if (item?.userId !== identity.subject) {
      throw new Error("You do not have permission to update this agenda item.");
    }

    await ctx.db.patch(args._id, {
      userId: args.userId,
      productionId: args.productionId,
      venueId: args.venueId,
      date: args.date,
      start_time: args.start_time,
      status: args.status,
    });
  },
});
