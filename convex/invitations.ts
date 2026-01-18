import { action } from "./_generated/server";
import { v } from "convex/values";

export const sendInvitation = action({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify user is authenticated
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Call Clerk API
    const response = await fetch("https://api.clerk.com/v1/invitations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: args.email,
        notify: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.errors?.[0]?.message || "Failed to send invitation",
      );
    }

    return { success: true };
  },
});
