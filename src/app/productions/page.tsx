"use client";

import { Authenticated } from "convex/react";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Id } from "../../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";

import React, { useCallback } from "react";

export default function Page() {
  const router = useRouter();

  const upcomingPremieres = useQuery(api.productions.getUpcomingPremieres);
  const likedProductions = useQuery(
    api.production_likes.getTopLikedProductionsForUser,
  );

  const handleViewAll = useCallback(() => {
    router.push("/productions/liked");
  }, [router]);

  const filteredLikedProductions = React.useMemo(
    () =>
      likedProductions?.filter(
        (production): production is Production => production !== null,
      ) ?? [],
    [likedProductions],
  );

  return (
    <Authenticated>
      <div className="mx-6 my-4 pb-20">
        <div className="flex flex-col gap-4">
          <div className="flex flex-row">
            <div className="text-3xl font-bold">Voorstellingen</div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4">
              <div className="text-base font-semibold">Opgeslagen</div>
              <div className="flex flex-col gap-2 pb-4">
                {filteredLikedProductions.map((production) => (
                  <MemoLikedProduction
                    key={production.priref_id}
                    production={production}
                  />
                ))}
                {likedProductions && likedProductions.length >= 3 && (
                  <div className="flex flex-row justify-end p-2">
                    <button
                      className="text-xs text-blue-500 font-semibold"
                      onClick={handleViewAll}
                    >
                      Bekijk alles
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="text-base font-semibold">
              Binnenkort in premiere
            </div>
            <div
              className="flex flex-row gap-4 pb-4"
              style={{
                overflowX: "auto",
                overflowY: "hidden",
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "thin",
              }}
            >
              {upcomingPremieres &&
                upcomingPremieres.map((production) => (
                  <MemoProductionCard
                    key={production.priref_id}
                    production={production}
                  />
                ))}
            </div>
          </div>
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
  // Add other fields if needed
};

const MemoProductionCard = React.memo(function ProductionCard({
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
      className="gap-2 py-4 min-w-40 bg-stone-200 border-b-4 border-r-4 rounded-sm place-content-center"
      onClick={() => handleProductionClick(production._id)}
    >
      <CardHeader className="flex flex-col">
        <CardTitle className="text-sm min-h-8 max-h-8 text-wrap">
          {production.title.length > 20
            ? production.title.slice(0, 17) + "..."
            : production.title}
        </CardTitle>
        <div className="text-xs text-stone-800 text-medium py-1">
          {new Date(production.start_date).toISOString().slice(0, 10)}
        </div>
      </CardHeader>
      <CardContent className="text-xs text-stone-500">
        {production.producer
          .slice(0, 2)
          .map((name) => {
            const parts = name.split(",").map((part) => part.trim());
            return parts.length === 2 ? `${parts[1]} ${parts[0]}` : name;
          })
          .join(", ")}
      </CardContent>
    </Card>
  );
});

const MemoLikedProduction = React.memo(function LikedProduction({
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
      className="gap-2 py-4 border-b-4 border-r-4 rounded-sm bg-lime-200"
      onClick={() => handleProductionClick(production._id)}
    >
      <CardHeader className="flex flex-col">
        <CardTitle className="text-xs text-wrap">{production.title}</CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-stone-600">
        {production.producer
          .slice(0, 2)
          .map((name) => {
            const parts = name.split(",").map((part) => part.trim());
            return parts.length === 2 ? `${parts[1]} ${parts[0]}` : name;
          })
          .join(", ")}
      </CardContent>
    </Card>
  );
});
