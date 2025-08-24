import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addGroupAgendaItem = mutation({
  args: {
    groupId: v.id("groups"),
    productionId: v.id("productions"),
    venueId: v.id("venues"),
    date: v.string(),
    start_time: v.string(),
  },
  handler: async (ctx, args) => {
    let { groupId, productionId, venueId, date, start_time } = args;

    await ctx.db.insert("groupAgenda", {
      groupId,
      productionId,
      venueId,
      date,
      start_time,
    });

    const groupMembers = await ctx.db
      .query("groupMembers")
      .filter((q) => q.eq(q.field("groupId"), groupId))
      .collect();

    for (const member of groupMembers) {
      await ctx.db.insert("userAgenda", {
        userId: member.userId,
        productionId,
        venueId,
        date,
        start_time,
        status: "planned",
      });
    }
  },
});

export const getGroupVisitCount = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const visits = await ctx.db
      .query("groupAgenda")
      .filter((q) =>
        q.and(
          q.eq(q.field("groupId"), args.groupId),
          q.lt(q.field("date"), new Date(Date.now()).toISOString()),
        ),
      )
      .collect();

    return visits.length;
  },
});
