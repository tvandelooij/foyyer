"use client";

import { Authenticated } from "convex/react";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Id } from "../../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";

export default function Page() {
  const upcomingPremieres = useQuery(api.productions.getUpcomingPremieres);
  const likedProductions = useQuery(
    api.production_likes.getLikedProductionsForUser,
  );

  return (
    <Authenticated>
      <div className="mx-6 my-4 pb-20">
        <div className="flex flex-col gap-4">
          <div className="flex flex-row">
            <div className="text-3xl font-bold">Voorstellingen</div>
          </div>
          <div className="flex flex-col gap-4">
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
                  <ProductionCard
                    key={production.priref_id}
                    production={production}
                  />
                ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="text-base font-semibold">Opgeslagen</div>
            <div className="flex flex-col gap-2 pb-4">
              {likedProductions &&
                likedProductions.map((production) => (
                  <LikedProduction
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
  _id: Id<"productions">;
  priref_id: string;
  title: string;
  start_date: string;
  discipline: string;
  producer: string[];
  venue: string;
  // Add other fields if needed
};

function ProductionCard({ production }: { production: Production }) {
  const router = useRouter();

  const handleProductionClick = (id: Id<"productions">) => {
    router.push(`/productions/${id}`);
  };

  return (
    <Card
      className="gap-2 py-4 min-w-40 bg-stone-50 border-red-950 border-2 shadow-none rounded-none"
      onClick={() => handleProductionClick(production._id)}
    >
      <CardHeader className="flex flex-col">
        <CardTitle className="text-sm min-h-8 max-h-8 text-wrap">
          {production.title.length > 20
            ? production.title.slice(0, 17) + "..."
            : production.title}
        </CardTitle>
        <div className="text-xs text-gray-800 text-medium pt-1">
          {new Date(production.start_date).toISOString().slice(0, 10)}
        </div>
      </CardHeader>
      <CardContent className="text-xs text-gray-500">
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
}

function LikedProduction({ production }: { production: Production }) {
  const router = useRouter();

  const handleProductionClick = (id: Id<"productions">) => {
    router.push(`/productions/${id}`);
  };

  return (
    <Card
      className="gap-2 py-4"
      onClick={() => handleProductionClick(production._id)}
    >
      <CardHeader className="flex flex-col">
        <CardTitle className="text-xs text-wrap">{production.title}</CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-gray-500">
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
}
