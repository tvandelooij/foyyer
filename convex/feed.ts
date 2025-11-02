import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

export const createFeedItem = mutation({
  args: {
    userId: v.string(),
    type: v.union(v.literal("review")),
    data: v.union(
      v.object({
        productionId: v.id("productions"),
        reviewId: v.id("productionReviews"),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const { userId, data } = args;
    await ctx.db.insert("feed", {
      userId,
      type: args.type,
      data,
    });
  },
});

export const getItemsForUser = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    // Get user's friends using indexed queries (no full table scan)
    const [friendships1, friendships2] = await Promise.all([
      ctx.db
        .query("friendships")
        .withIndex("by_user_1_status", (q) =>
          q.eq("userId1", userId).eq("status", "accepted"),
        )
        .collect(),
      ctx.db
        .query("friendships")
        .withIndex("by_user_2_status", (q) =>
          q.eq("userId2", userId).eq("status", "accepted"),
        )
        .collect(),
    ]);

    const friends = [
      ...friendships1.map((f) => f.userId2),
      ...friendships2.map((f) => f.userId1),
    ];

    // If no friends, return empty array early
    if (friends.length === 0) {
      return [];
    }

    // Query feed items for each friend in parallel
    const feedItemsPerFriend = await Promise.all(
      friends.map((friendId) =>
        ctx.db
          .query("feed")
          .withIndex("by_user", (q) => q.eq("userId", friendId))
          .collect(),
      ),
    );

    // Flatten and sort all feed items by creation time (newest first)
    const feedItems = feedItemsPerFriend
      .flat()
      .sort((a, b) => b._creationTime - a._creationTime);

    return feedItems;
  },
});

export const getItemsForUserPaginated = query({
  args: {
    userId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, { userId, paginationOpts }) => {
    // Get user's friends using indexed queries (no full table scan)
    const [friendships1, friendships2] = await Promise.all([
      ctx.db
        .query("friendships")
        .withIndex("by_user_1_status", (q) =>
          q.eq("userId1", userId).eq("status", "accepted"),
        )
        .collect(),
      ctx.db
        .query("friendships")
        .withIndex("by_user_2_status", (q) =>
          q.eq("userId2", userId).eq("status", "accepted"),
        )
        .collect(),
    ]);

    const friends = [
      ...friendships1.map((f) => f.userId2),
      ...friendships2.map((f) => f.userId1),
    ];

    // If no friends, return empty result early
    if (friends.length === 0) {
      return {
        page: [],
        isDone: true,
        continueCursor: "",
      };
    }

    // Query feed items for each friend in parallel
    // Note: We collect all items per friend since we need to sort by _creationTime across all friends
    const feedItemsPerFriend = await Promise.all(
      friends.map((friendId) =>
        ctx.db
          .query("feed")
          .withIndex("by_user", (q) => q.eq("userId", friendId))
          .collect(),
      ),
    );

    // Flatten and sort all feed items by creation time (newest first)
    const allFeedItems = feedItemsPerFriend
      .flat()
      .sort((a, b) => b._creationTime - a._creationTime);

    // Manual pagination: determine start and end indices
    const cursor = paginationOpts.cursor;
    const startIndex =
      cursor && cursor !== "" ? parseInt(cursor as string, 10) : 0;
    const endIndex = startIndex + paginationOpts.numItems;

    const page = allFeedItems.slice(startIndex, endIndex);
    const isDone = endIndex >= allFeedItems.length;
    const continueCursor = isDone ? "" : endIndex.toString();

    return {
      page,
      isDone,
      continueCursor,
    };
  },
});

export const getFeedItemFromUserByProduction = query({
  args: {
    userId: v.string(),
    productionId: v.id("productions"),
    type: v.union(v.literal("review")),
  },
  handler: async (ctx, args) => {
    const feedItems = await ctx.db
      .query("feed")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return feedItems.filter(
      (item) =>
        item.type === "review" && item.data.productionId === args.productionId,
    );
  },
});

export const deleteFeedItem = mutation({
  args: { id: v.id("feed") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
