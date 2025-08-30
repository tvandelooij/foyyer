"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Input } from "@/components/ui/input";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { DiscoverCategories } from "./discover";

interface MultiSearchResult {
  type: "production" | "user" | "group";
  id: string;
  display: string;
  pictureUrl?: string;
  description?: string;
  // ...other fields as needed
}

export default function MultiSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize query from URL
  const initialQ = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQ);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQ);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  // Debounce input and update URL
  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      // Update URL param (replace, not push)
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      router.replace(`?${params.toString()}`);
      if (timer) clearTimeout(timer);
      const newTimer = setTimeout(() => {
        setDebouncedQuery(value);
      }, 500);
      setTimer(newTimer);
    },
    [timer, router, searchParams],
  );

  // Sync state if user navigates with browser (back/forward)
  useEffect(() => {
    const urlQ = searchParams.get("q") || "";
    setQuery(urlQ);
    setDebouncedQuery(urlQ);
  }, [searchParams]);

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
    description: r.description,
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
        placeholder="Voorstelling, producent, vrienden"
        className="text-base rounded-sm border-2 border-b-4 border-red-950 h-10 dark:border-gray-200"
        value={query}
        onChange={handleInput}
      />
      <div className="flex flex-col gap-4">
        {rawResults.length < 1 && !debouncedQuery && (
          <div className="pt-2">
            <DiscoverCategories />
          </div>
        )}
        {debouncedQuery && (
          <>
            {grouped.productions.length > 0 && (
              <div>
                <div className="font-semibold text-xs text-gray-500 mb-1">
                  Voorstellingen
                </div>
                <div className="flex flex-col gap-2">
                  {grouped.productions.map((prod) => (
                    <Link
                      key={prod.id}
                      href={`/productions/${prod.id}`}
                      className="hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 border-b-2"
                    >
                      <Card className="border-none py-4">
                        <CardHeader>
                          <CardTitle className="text-xs">
                            {prod.display}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {prod.description?.split(" ? ").join(", ")}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {grouped.groups.length > 0 && (
              <div>
                <div className="font-semibold text-xs text-gray-500 mb-1">
                  Groepen
                </div>
                <div className="flex flex-col gap-2">
                  {grouped.groups.map((group) => (
                    <Link
                      key={group.id}
                      href={`/groups/${group.id}`}
                      className="hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 border-b-2"
                    >
                      <Card className="border-none py-4">
                        <CardHeader>
                          <CardTitle className="text-xs">
                            {group.display}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {group.description}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {grouped.users.length > 0 && (
              <div>
                <div className="font-semibold text-xs text-gray-500 mb-1">
                  Gebruikers
                </div>
                <div className="flex flex-col gap-2">
                  {grouped.users.map((user) => (
                    <Link
                      key={user.id}
                      href={`/users/${user.id}`}
                      className="hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 border-b-2"
                    >
                      <Card className="border-none py-4 gap-0">
                        <CardHeader>
                          <CardTitle className="text-xs">
                            {user.display}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
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
