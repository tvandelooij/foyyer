import { query } from "./_generated/server";
import { v } from "convex/values";

export const getVenues = query({
  handler: async (ctx) => {
    return ctx.db.query("venues").collect();
  },
});

export const getVenueById = query({
  args: { venueId: v.id("venues") },
  handler: async (ctx, { venueId }) => {
    return ctx.db.get(venueId);
  },
});
