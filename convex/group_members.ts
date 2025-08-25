import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getGroupsForUserId = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const groupMemberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId as string))
      .collect();

    const groupIds = groupMemberships.map((gm) => gm.groupId);

    const groups = await Promise.all(groupIds.map((id) => ctx.db.get(id)));
    return groups.filter(Boolean);
  },
});

export const getMemberCountForGroupId = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const memberCount = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    return memberCount.length;
  },
});

export const listGroupMembers = query({
  args: { groupId: v.id("groups") },
  handler: (ctx, args) => {
    return ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();
  },
});

export const addGroupMember = mutation({
  args: { groupId: v.id("groups"), userId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.insert("groupMembers", {
      groupId: args.groupId,
      userId: args.userId,
      joinedAt: Date.now(),
    });
  },
});

export const deleteGroupMembers = mutation({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    // get member id for group id
    const members = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    for (const member of members) {
      await ctx.db.delete(member._id);
    }
  },
});

export const getMembersForGroupId = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    return members;
  },
});
