import { query } from "./_generated/server";

export const getVenues = query({
  handler: async (ctx) => {
    return ctx.db.query("venues").collect();
  },
});
