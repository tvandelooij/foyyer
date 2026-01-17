import { query } from "./_generated/server";
import { v } from "convex/values";

export default query({
  args: {
    q: v.string(),
    currentUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { q, currentUserId } = args;
    if (!q || q.trim() === "") return [];

    // Search productions by title
    const productionsByTitle = await ctx.db
      .query("productions")
      .withSearchIndex("search_title", (qBuilder) =>
        qBuilder.search("title", q),
      )
      .take(5);

    const productionsByProducer = await ctx.db
      .query("productions")
      .withSearchIndex("search_producer", (qBuilder) =>
        qBuilder.search("producer", q),
      )
      .take(5);

    const productionsMap = new Map();
    [...productionsByTitle, ...productionsByProducer].forEach((p) => {
      productionsMap.set(p._id, p);
    });
    const productions = Array.from(productionsMap.values());

    // Search users by nickname
    const users = await ctx.db
      .query("users")
      .withSearchIndex("search_nickname", (qBuilder) =>
        qBuilder.search("nickname", q),
      )
      .take(5);

    // Search groups by name
    const groups = await ctx.db
      .query("groups")
      .withSearchIndex("search_name", (qBuilder) => qBuilder.search("name", q))
      .take(5);

    // Get current user's friends for mutual friend count
    let currentUserFriendIds: string[] = [];
    if (currentUserId) {
      const friendships1 = await ctx.db
        .query("friendships")
        .withIndex("by_user_1_status", (idx) =>
          idx.eq("userId1", currentUserId).eq("status", "accepted"),
        )
        .collect();
      const friendships2 = await ctx.db
        .query("friendships")
        .withIndex("by_user_2_status", (idx) =>
          idx.eq("userId2", currentUserId).eq("status", "accepted"),
        )
        .collect();
      currentUserFriendIds = [
        ...friendships1.map((f) => f.userId2),
        ...friendships2.map((f) => f.userId1),
      ];
    }

    // Get member counts for groups
    const groupMemberCounts = await Promise.all(
      groups.map(async (g) => {
        const members = await ctx.db
          .query("groupMembers")
          .withIndex("by_group", (idx) => idx.eq("groupId", g._id))
          .collect();
        return { groupId: g._id, count: members.length };
      }),
    );
    const memberCountMap = new Map(
      groupMemberCounts.map((g) => [g.groupId.toString(), g.count]),
    );

    // Calculate mutual friends for each user
    const usersWithMutualFriends = await Promise.all(
      users.map(async (u) => {
        let mutualFriendCount = 0;
        if (currentUserId && u.userId !== currentUserId) {
          const userFriendships1 = await ctx.db
            .query("friendships")
            .withIndex("by_user_1_status", (idx) =>
              idx.eq("userId1", u.userId).eq("status", "accepted"),
            )
            .collect();
          const userFriendships2 = await ctx.db
            .query("friendships")
            .withIndex("by_user_2_status", (idx) =>
              idx.eq("userId2", u.userId).eq("status", "accepted"),
            )
            .collect();
          const userFriendIds = new Set([
            ...userFriendships1.map((f) => f.userId2),
            ...userFriendships2.map((f) => f.userId1),
          ]);
          mutualFriendCount = currentUserFriendIds.filter((id) =>
            userFriendIds.has(id),
          ).length;
        }
        return { ...u, mutualFriendCount };
      }),
    );

    return [
      ...productions.map((p) => ({
        type: "production" as const,
        id: p._id,
        display: p.title,
        description: p.producer,
        category: p.discipline,
        ...p,
      })),
      ...usersWithMutualFriends.map((u) => ({
        type: "user" as const,
        id: u.userId,
        display: u.nickname,
        description: undefined,
        ...u,
      })),
      ...groups.map((g) => ({
        type: "group" as const,
        id: g._id,
        display: g.name,
        memberCount: memberCountMap.get(g._id.toString()) || 0,
        ...g,
        description: g.description,
      })),
    ];
  },
});
