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
  userAgenda: defineTable({
    userId: v.string(),
    productionId: v.id("productions"),
    venueId: v.id("venues"),
    date: v.string(),
    start_time: v.string(),
    status: v.union(
      v.literal("planned"),
      v.literal("confirmed"),
      v.literal("canceled"),
    ),
    groupId: v.optional(v.id("groups")),
  })
    .index("by_date", ["date"])
    .index("by_user", ["userId"]),
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
    type: v.union(
      v.literal("friend_request"),
      v.literal("like_review"),
      v.literal("group_invitation"),
    ), // e.g. "friend_request", "like_review"
    data: v.optional(
      v.object({
        senderId: v.optional(v.string()),
        reviewId: v.optional(v.string()),
        groupId: v.optional(v.string()),
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
  groupInvitations: defineTable({
    groupId: v.id("groups"),
    userId: v.string(),
    invitedAt: v.number(),
    invitedBy: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
    ),
  }),
  groupAgenda: defineTable({
    groupId: v.id("groups"),
    productionId: v.id("productions"),
    venueId: v.id("venues"),
    date: v.string(),
    start_time: v.string(),
  }).index("by_date", ["date"]),
  venues: defineTable({
    et_pageid: v.number(),
    name: v.string(),
    city: v.string(),
    location_type: v.string(),
    website: v.optional(v.string()),
  }).searchIndex("search_name", {
    searchField: "name",
  }),
  productions: defineTable({
    priref_id: v.string(),
    title: v.string(),
    discipline: v.string(),
    start_date: v.string(),
    producer: v.array(v.string()),
    venue: v.string(),
    notes: v.optional(v.string()),
  })
    .index("by_start_date", ["start_date"])
    .searchIndex("search_title", {
      searchField: "title",
    })
    .searchIndex("search_producer", {
      searchField: "producer",
    }),
  production_likes: defineTable({
    production_id: v.id("productions"),
    user_id: v.string(),
  })
    .index("by_user", ["user_id"])
    .index("by_production", ["production_id"]),
});
