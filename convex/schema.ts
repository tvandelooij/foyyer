import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    nickname: v.string(),
    email: v.string(),
    pictureUrl: v.optional(v.string()),
    updatedAt: v.number(),
  }).searchIndex("search_nickname", {
    searchField: "nickname",
  }),
  friendships: defineTable({
    userId1: v.id("users"),
    userId2: v.id("users"),
    status: v.string(), // "pending", "accepted", "blocked"
    createdAt: v.number(),
    updatedAt: v.number(),
  }),
});
