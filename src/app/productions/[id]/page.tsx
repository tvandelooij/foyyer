"use client";

import { Authenticated } from "convex/react";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "../../../../convex/_generated/dataModel";

import { Heart } from "lucide-react";

export default function Page() {
  const params = useParams();
  const id = params.id as Id<"productions">;

  const production = useQuery(api.productions.getProductionById, { id });

  return (
    <Authenticated>
      <div className="mx-6 my-4 pb-20">
        <div className="flex flex-row justify-between items-center">
          <div className="text-3xl font-bold">{production?.title}</div>
          <div className="">
            <Heart className="text-red-400" />
          </div>
        </div>
      </div>
    </Authenticated>
  );
}
