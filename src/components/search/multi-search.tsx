"use client";

import { useState, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface MultiSearchResult {
  type: "production" | "user" | "group";
  id: string;
  display: string;
  pictureUrl?: string;
  // ...other fields as needed
}

export default function MultiSearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  // Debounce input
  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
      if (timer) clearTimeout(timer);
      const newTimer = setTimeout(() => {
        setDebouncedQuery(e.target.value);
      }, 500);
      setTimer(newTimer);
    },
    [timer],
  );

  const rawResults =
    useQuery(
      api.search.default,
      debouncedQuery ? { q: debouncedQuery } : "skip",
    ) || [];

  const results: MultiSearchResult[] = rawResults.map((r: any) => ({
    type: r.type as "production" | "user" | "group",
    id: r.id ?? r._id,
    display: r.display,
    pictureUrl: r.pictureUrl,
    // ...add other fields as needed
  }));

  // Group results by type
  const grouped = {
    productions: results.filter((r) => r.type === "production"),
    users: results.filter((r) => r.type === "user"),
    groups: results.filter((r) => r.type === "group"),
  };

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Voorstelling, groep, gebruiker"
        className="text-base rounded-sm border-2 border-b-4 border-red-950 h-10"
        value={query}
        onChange={handleInput}
      />
      <div className="flex flex-col gap-4">
        {debouncedQuery && (
          <>
            {grouped.productions.length > 0 && (
              <div>
                <div className="font-semibold text-xs text-gray-500 mb-1">
                  Voorstellingen
                </div>
                <ul className="grid gap-2">
                  {grouped.productions.map((prod) => (
                    <li key={prod.id}>
                      <Link
                        href={`/productions/${prod.id}`}
                        className="block p-3 border rounded bg-white hover:bg-gray-50 shadow-sm"
                      >
                        <span className="font-medium">{prod.display}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {grouped.groups.length > 0 && (
              <div>
                <div className="font-semibold text-xs text-gray-500 mb-1">
                  Groepen
                </div>
                <ul className="grid gap-2">
                  {grouped.groups.map((group) => (
                    <li key={group.id}>
                      <Link
                        href={`/groups/${group.id}`}
                        className="block p-3 border rounded bg-white hover:bg-gray-50 shadow-sm"
                      >
                        <span className="font-medium">{group.display}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {grouped.users.length > 0 && (
              <div>
                <div className="font-semibold text-xs text-gray-500 mb-1">
                  Gebruikers
                </div>
                <ul className="grid gap-2">
                  {grouped.users.map((user) => (
                    <li key={user.id}>
                      <Link
                        href={`/profile/${user.id}`}
                        className="block p-3 border rounded bg-white hover:bg-gray-50 shadow-sm"
                      >
                        <span className="font-medium">{user.display}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {results.length === 0 && (
              <div className="text-gray-400 text-sm">
                Geen resultaten gevonden
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
