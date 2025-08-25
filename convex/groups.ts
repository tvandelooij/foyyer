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
      .withIndex("by_user", (q) => q.eq("createdBy", identity.subject))
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

export const getGroupById = query({
  args: { id: v.id("groups") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const group = await ctx.db.get(args.id);

    if (group === null) {
      throw new Error("Group not found");
    }

    const isInvited = await ctx.db
      .query("groupInvitations")
      .withIndex("by_group_UserId", (q) =>
        q.eq("groupId", group._id).eq("userId", identity.subject),
      )
      .first();

    if (isInvited) {
      return group;
    }

    if (group.createdBy !== identity.subject) {
      throw new Error("Not authorized");
    }

    const groupMembers = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", group._id))
      .collect();

    const isMember = groupMembers
      .map((gm) => gm.userId)
      .includes(identity.subject);

    if (!isMember && group.visibility === "private") {
      throw new Error("Not authorized");
    }

    return group;
  },
});

export const getGroupNameById = query({
  args: { id: v.id("groups") },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.id);
    if (group === null) {
      throw new Error("Group not found");
    }
    return group.name;
  },
});

export const deleteGroup = mutation({
  args: { id: v.id("groups") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const group = await ctx.db.get(args.id);

    if (group === null) {
      throw new Error("Group not found");
    }

    if (group.createdBy !== identity.subject) {
      throw new Error("Not authorized");
    }

    await ctx.db.delete(group._id);
  },
});
