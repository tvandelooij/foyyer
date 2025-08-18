import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createNotification = mutation({
  args: { userId: v.id("users"), type: v.string(), data: v.any() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("nickname"), identity.nickname))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const data = (args.data["senderId"] = user._id);

    return await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      data,
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

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("nickname"), identity.nickname))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    return await ctx.db
      .query("notifications")
      .filter((q) =>
        q.and(q.eq(q.field("userId"), user._id), q.eq(q.field("read"), false)),
      )
      .collect();
  },
});

export const hasUnreadNotifications = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("nickname"), identity.nickname))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const notifications = await ctx.db
      .query("notifications")
      .filter((q) => q.eq(q.field("userId"), user._id))
      .collect();

    return notifications.some((n) => !n.read);
  },
});

export const markNotificationAsRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("nickname"), identity.nickname))
      .first();

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new Error("Notification not found");
    }

    if (notification.userId !== user?._id) {
      throw new Error("You can only mark your own notifications as read");
    }

    return await ctx.db.patch(args.notificationId, { read: true });
  },
});
