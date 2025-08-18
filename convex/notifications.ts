import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createNotification = mutation({
  args: { userId: v.string(), type: v.string(), data: v.any() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const senderId = identity.subject as Id<"users">;

    return await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type as "friend_request" | "like_review",
      data: { senderId: senderId },
      read: false,
      createdAt: Date.now(),
    });
  },
});

export const getNotificationsForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const notifications = await ctx.db
      .query("notifications")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), identity.subject),
          q.eq(q.field("read"), false),
        ),
      )
      .collect();

    return notifications;
  },
});

export const hasUnreadNotifications = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const notifications = await ctx.db
      .query("notifications")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();

    return notifications.some((n) => !n.read);
  },
});

export const getNotificationIdForFriendship = query({
  args: {
    userId: v.optional(v.string()),
    data: v.object({ senderId: v.optional(v.string()) }),
  },
  handler: async (ctx, args) => {
    const notification = await ctx.db
      .query("notifications")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("data.senderId"), args.data.senderId),
        ),
      )
      .first();

    return notification?._id;
  },
});

export const markNotificationAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new Error("Notification not found");
    }

    if (notification.userId !== identity.subject) {
      throw new Error("You can only mark your own notifications as read");
    }

    return await ctx.db.patch(args.notificationId, { read: true });
  },
});
