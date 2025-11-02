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
    const allFriendships = await ctx.db.query("friendships").collect();
    const friends = allFriendships
      .filter(
        (f) =>
          f.status === "accepted" &&
          (f.userId1 === userId || f.userId2 === userId),
      )
      .map((f) => (f.userId1 === userId ? f.userId2 : f.userId1));

    const allFeed = await ctx.db.query("feed").collect();
    const feedItems = allFeed
      .filter((item) => friends.includes(item.userId))
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
    // Get user's friends
    const allFriendships = await ctx.db.query("friendships").collect();
    const friends = allFriendships
      .filter(
        (f) =>
          f.status === "accepted" &&
          (f.userId1 === userId || f.userId2 === userId),
      )
      .map((f) => (f.userId1 === userId ? f.userId2 : f.userId1));

    // Get paginated feed items ordered by creation time (newest first)
    const result = await ctx.db
      .query("feed")
      .order("desc")
      .paginate(paginationOpts);

    // Filter to only include items from friends
    const filteredPage = result.page.filter((item) =>
      friends.includes(item.userId),
    );

    return {
      ...result,
      page: filteredPage,
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
