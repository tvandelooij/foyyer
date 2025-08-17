"use client";

import { useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";

import { useCallback } from "react";

export function useSearch() {
  const convex = useConvex();

  const search = useCallback(
    async (query: string) => {
      const users = await convex.query(api.users.getUsers, { query });
      return users;
    },
    [convex],
  );

  return { search };
}
