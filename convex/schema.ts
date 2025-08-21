import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    userId: v.string(),
    nickname: v.string(),
    email: v.string(),
    pictureUrl: v.optional(v.string()),
    updatedAt: v.number(),
  }).searchIndex("search_nickname", {
    searchField: "nickname",
  }),
  friendships: defineTable({
    userId1: v.string(),
    userId2: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
    ), // "pending", "accepted", "blocked"
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_users", ["userId1", "userId2"]),
  notifications: defineTable({
    userId: v.string(),
    type: v.union(v.literal("friend_request"), v.literal("like_review")), // e.g. "friend_request", "like_review"
    data: v.optional(
      v.object({
        senderId: v.optional(v.string()),
        reviewId: v.optional(v.string()),
      }),
    ), // additional data, e.g. reviewId, senderId
    read: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
  groups: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    visibility: v.union(v.literal("public"), v.literal("private")),
    pictureUrl: v.optional(v.string()),
    createdBy: v.string(), // userId of the creator
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .searchIndex("search_name", {
      searchField: "name",
    })
    .index("by_user", ["createdBy"]),
  groupMembers: defineTable({
    groupId: v.id("groups"),
    userId: v.string(),
    joinedAt: v.number(),
    role: v.optional(v.string()), // e.g. "member", "admin"
  })
    .index("by_group", ["groupId"])
    .index("by_user", ["userId"]),
});
