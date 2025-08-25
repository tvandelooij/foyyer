"use client";

import { useQuery } from "convex-helpers/react/cache/hooks";
import { Authenticated } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Id } from "../../../../convex/_generated/dataModel";

export default function Page() {
  const likedProductions = useQuery(
    api.production_likes.getAllLikedProductions,
  );

  return (
    <Authenticated>
      <div className="mx-6 my-4 pb-20">
        <div className="flex flex-col gap-2">
          <div className="text-3xl font-bold">Opgeslagen Voorstellingen</div>
          {likedProductions &&
            likedProductions.map((production) => (
              <LikedProduction
                key={production.priref_id}
                production={production}
              />
            ))}
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

function LikedProduction({ production }: { production: Production }) {
  const router = useRouter();

  const handleProductionClick = (id: Id<"productions">) => {
    router.push(`/productions/${id}`);
  };

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
}
