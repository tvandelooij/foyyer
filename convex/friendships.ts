import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createFriendship = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const userId1 = identity.subject;
    const userId2 = args.userId;

    if (!userId1) {
      throw new Error("Current user not found");
    }

    if (userId1 === userId2) {
      throw new Error("Cannot befriend yourself");
    }

    const existingFriendship = await ctx.db
      .query("friendships")
      .filter((q) =>
        q.or(
          q.and(
            q.eq(q.field("userId1"), userId1),
            q.eq(q.field("userId2"), userId2),
          ),
          q.and(
            q.eq(q.field("userId1"), userId2),
            q.eq(q.field("userId2"), userId1),
          ),
        ),
      )
      .first();

    if (existingFriendship) {
      throw new Error("Friendship already exists");
    }

    const friendship = {
      userId1,
      userId2,
      status: "pending" as "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    return await ctx.db.insert("friendships", friendship);
  },
});

export const getFriendship = query({
  args: { userId: v.string(), friendId: v.string() },
  handler: async (ctx, args) => {
    const friendship = await ctx.db
      .query("friendships")
      .filter((q) =>
        q.or(
          q.and(
            q.eq(q.field("userId1"), args.userId),
            q.eq(q.field("userId2"), args.friendId),
          ),
          q.and(
            q.eq(q.field("userId1"), args.friendId),
            q.eq(q.field("userId2"), args.userId),
          ),
        ),
      )
      .first();

    return friendship;
  },
});

export const getTotalFriends = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const totalFriends = await ctx.db
      .query("friendships")
      .filter((q) =>
        q.or(
          q.eq(q.field("userId1"), args.userId),
          q.eq(q.field("userId2"), args.userId),
        ),
      )
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();

    return totalFriends.length;
  },
});

export const updateFriendshipStatus = mutation({
  args: { senderId: v.string(), status: v.string() },
  handler: async (ctx, args) => {
    const { senderId, status } = args;
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const userId1 = identity.subject;
    const userId2 = senderId;

    if (!userId1) {
      throw new Error("Current user not found");
    }

    const friendship = await ctx.db
      .query("friendships")
      .filter((q) =>
        q.or(
          q.and(
            q.eq(q.field("userId1"), userId1),
            q.eq(q.field("userId2"), userId2),
          ),
          q.and(
            q.eq(q.field("userId1"), userId2),
            q.eq(q.field("userId2"), userId1),
          ),
        ),
      )
      .first();

    if (!friendship) {
      throw new Error("Friendship not found");
    }

    await ctx.db.patch(friendship._id, {
      status: status as "pending" | "accepted" | "declined",
    });
  },
});

export const listFriendsForUserId = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject as Id<"users">;

    if (!userId) {
      throw new Error("Current user not found");
    }

    return ctx.db
      .query("friendships")
      .filter((q) =>
        q.or(
          q.eq(q.field("userId1"), userId),
          q.eq(q.field("userId2"), userId),
        ),
      )
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();
  },
});

// Denormalized query that fetches friends with their user details
export const listFriendsWithDetailsForUser = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Get all friendships for this user
    const friendships = await ctx.db
      .query("friendships")
      .filter((q) =>
        q.or(
          q.eq(q.field("userId1"), args.userId),
          q.eq(q.field("userId2"), args.userId),
        ),
      )
      .filter((q) => q.eq(q.field("status"), "accepted"))
      .collect();

    // Extract friend user IDs
    const friendUserIds = friendships.map((f) =>
      f.userId1 === args.userId ? f.userId2 : f.userId1,
    );

    // Fetch user details for all friends in parallel
    const friendsWithDetails = await Promise.all(
      friendUserIds.map(async (friendUserId, index) => {
        const user = await ctx.db
          .query("users")
          .withIndex("by_userId", (q) => q.eq("userId", friendUserId))
          .first();

        const friendship = friendships[index];

        return {
          userId: friendUserId,
          nickname: user?.nickname || "Unknown",
          pictureUrl: user?.pictureUrl,
          friendsSince: friendship.createdAt,
        };
      }),
    );

    // Sort by friendship date (newest first)
    return friendsWithDetails.sort((a, b) => b.friendsSince - a.friendsSince);
  },
});
