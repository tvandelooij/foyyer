"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Drama, User, Users } from "lucide-react";

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
  category?: string;
  memberCount?: number;
  mutualFriendCount?: number;
}

export default function MultiSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();

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
      debouncedQuery ? { q: debouncedQuery, currentUserId: user?.id } : "skip",
    ) || [];

  const results: MultiSearchResult[] = rawResults.map((r: any) => ({
    type: r.type as "production" | "user" | "group",
    id: r.id ?? r._id,
    display: r.display,
    pictureUrl: r.pictureUrl,
    description: r.description,
    category: r.category,
    memberCount: r.memberCount,
    mutualFriendCount: r.mutualFriendCount,
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
                        <CardHeader className="flex flex-row items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <Drama className="h-5 w-5 text-red-950 dark:text-gray-200" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <CardTitle className="text-xs">
                              {prod.display}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {prod.description?.split(" ? ").join(", ")}
                            </CardDescription>
                            {prod.category && (
                              <span className="text-xs text-gray-400">
                                {prod.category}
                              </span>
                            )}
                          </div>
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
                        <CardHeader className="flex flex-row items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <Users className="h-5 w-5 text-red-950 dark:text-gray-200" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <CardTitle className="text-xs">
                              {group.display}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {group.description}
                            </CardDescription>
                            {group.memberCount !== undefined && (
                              <span className="text-xs text-gray-400">
                                {group.memberCount}{" "}
                                {group.memberCount === 1 ? "lid" : "leden"}
                              </span>
                            )}
                          </div>
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
                  {grouped.users.map((u) => (
                    <Link
                      key={u.id}
                      href={`/profile/${u.id}`}
                      className="hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 border-b-2"
                    >
                      <Card className="border-none py-4 gap-0">
                        <CardHeader className="flex flex-row items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <User className="h-5 w-5 text-red-950 dark:text-gray-200" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <CardTitle className="text-xs">
                              {u.display}
                            </CardTitle>
                            {u.mutualFriendCount !== undefined &&
                              u.mutualFriendCount > 0 && (
                                <span className="text-xs text-gray-400">
                                  {u.mutualFriendCount} gemeenschappelijke{" "}
                                  {u.mutualFriendCount === 1
                                    ? "vriend"
                                    : "vrienden"}
                                </span>
                              )}
                          </div>
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
