"use client";

import { useQuery } from "convex-helpers/react/cache/hooks";
import { Authenticated } from "convex/react";
import { memo, use, useCallback } from "react";
import { api } from "../../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Page({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = use(params);
  const productions = useQuery(
    api.productions.getRandomProductionsForCategory,
    category === "muziek" ? { category: "muziektheater" } : { category },
  );

  return (
    <Authenticated>
      <div className="mx-6 my-4 pb-20">
        <div className="flex flex-col gap-4">
          <div className="text-3xl font-bold">
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </div>
          {productions?.map((production) => (
            <MemoLikedProduction
              key={production.priref_id}
              production={{
                ...production,
                tags: production.tags ?? [],
              }}
            />
          ))}
        </div>
      </div>
    </Authenticated>
  );
}

type Production = {
  _creationTime: number;
  _id: Id<"productions">;
  priref_id: string;
  title: string;
  start_date: string;
  discipline: string;
  producer: string[];
  venue: string;
  tags: string[];
  // Add other fields if needed
};

const MemoLikedProduction = memo(function LikedProduction({
  production,
}: {
  production: Production;
}) {
  const router = useRouter();
  const handleProductionClick = useCallback(
    (id: Id<"productions">) => {
      router.push(`/productions/${id}`);
    },
    [router],
  );

  return (
    <Card
      className="gap-2 py-4 border-b-4 border-r-4 rounded-sm bg-stone-100"
      onClick={() => handleProductionClick(production._id)}
    >
      <CardHeader className="flex flex-col">
        <CardTitle className="text-sm text-semibold text-wrap">
          {production.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-stone-600 flex flex-col gap-2">
        <div>
          {production.producer
            .slice(0, 2)
            .map((name) => {
              const parts = name.split(",").map((part) => part.trim());
              return parts.length === 2 ? `${parts[1]} ${parts[0]}` : name;
            })
            .join(", ")}
        </div>
        <div className="flex flex-row flex-wrap gap-2">
          {production.tags.map((tag) => {
            return (
              <Badge
                key={tag}
                className="bg-indigo-300 rounded-sm font-medium text-white text-xs"
              >
                {tag}
              </Badge>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});
