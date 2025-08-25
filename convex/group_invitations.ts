import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getInvitationsForGroup = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("groupInvitations")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();
  },
});

export const createInvitation = mutation({
  args: { userId: v.string(), groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error("Not authenticated");
    }

    await ctx.db.insert("groupInvitations", {
      groupId: args.groupId,
      userId: args.userId,
      invitedAt: Date.now(),
      invitedBy: identity.subject,
      status: "pending",
    });
  },
});

export const updateInvitation = mutation({
  args: { groupId: v.id("groups"), status: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const invitation = await ctx.db
      .query("groupInvitations")
      .withIndex("by_group_UserId", (q) =>
        q.eq("groupId", args.groupId).eq("userId", identity.subject),
      )
      .first();

    if (invitation === null) {
      throw new Error("Invitation not found");
    }

    if (invitation.userId !== identity.subject) {
      throw new Error("Not authorized");
    }

    await ctx.db.patch(invitation._id, {
      status: args.status as "accepted" | "declined",
    });

    await ctx.db.insert("groupMembers", {
      userId: invitation.userId,
      groupId: invitation.groupId,
      joinedAt: Date.now(),
    });
  },
});

export const deleteGroupInvitations = mutation({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    // get member id for group id
    const invitations = await ctx.db
      .query("groupInvitations")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    for (const invitation of invitations) {
      await ctx.db.delete(invitation._id);
    }
  },
});
