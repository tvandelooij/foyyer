import { mutation } from "./_generated/server";

export const createUser = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();

        if (identity === null) {
            throw new Error("Not authenticated")
        }

        if (!identity.nickname || !identity.email) {
            throw new Error("User identity is missing nickname or email");
        }

        const user = {
            nickname: identity.nickname,
            email: identity.email,
            updatedAt: Date.now()
        }

        const existingUser = await ctx.db.query("users")
            .filter(q => q.eq(q.field("nickname"), user.nickname))
            .first();

        if (existingUser) {
            await ctx.db.patch(existingUser._id, { updatedAt: user.updatedAt });
            return existingUser._id;
        }

        const id = await ctx.db.insert("users", user);
        return id;
    }
})