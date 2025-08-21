import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getGroupsForUserId = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const groupIds = await ctx.db
      .query("groupMembers")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    const groupIdSet = new Set(groupIds.map((gm) => gm.groupId));
    return await ctx.db
      .query("groups")
      .collect()
      .then((groups) => groups.filter((group) => groupIdSet.has(group._id)));
  },
});

export const getMemberCountForGroupId = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const memberCount = await ctx.db
      .query("groupMembers")
      .filter((q) => q.eq(q.field("groupId"), args.groupId))
      .collect();

    return memberCount.length;
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
