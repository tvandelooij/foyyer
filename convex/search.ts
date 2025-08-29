import { query } from "./_generated/server";

export default query(async ({ db }, { q }) => {
  if (!q || typeof q !== "string" || q.trim() === "") return [];

  // Search productions by title
  const productions = await db
    .query("productions")
    .withSearchIndex("search_title", (qBuilder) => qBuilder.search("title", q))
    .take(5);

  // Search users by nickname
  const users = await db
    .query("users")
    .withSearchIndex("search_nickname", (qBuilder) =>
      qBuilder.search("nickname", q),
    )
    .take(5);

  // Search groups by name
  const groups = await db
    .query("groups")
    .withSearchIndex("search_name", (qBuilder) => qBuilder.search("name", q))
    .take(5);

  return [
    ...productions.map((p) => ({
      type: "production",
      id: p._id,
      display: p.title,
      description: p.producer,
      ...p,
    })),
    ...users.map((u) => ({
      type: "user",
      id: u.userId,
      display: u.nickname,
      description: undefined,
      ...u,
    })),
    ...groups.map((g) => ({
      type: "group",
      id: g._id,
      display: g.name,
      ...g,
      description: g.description,
    })),
  ];
});
