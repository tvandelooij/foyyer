"use client";

import { useParams } from "next/navigation";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "../../../../../convex/_generated/api";

import { Star } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
// import { useMutation } from "convex/react";

export default function Page() {
  const params = useParams();
  const id = params.id as Id<"productions">;

  const production = useQuery(api.productions.getProductionById, { id: id });
  // const maybeReview = useQuery(
  //   api.production_reviews.getReviewsForProductionByUser,
  //   { productionId: id },
  // );

  // const addReview = useMutation(api.production_reviews.createReview);
  // const updateReview = useMutation(api.production_reviews.updateReview);

  const [selectedStars, setSelectedStars] = useState(0);

  const handleStarClick = (star: number) => {
    if (star === selectedStars) {
      setSelectedStars(0);
    } else {
      setSelectedStars(star);
    }
  };

  return (
    <div className="flex flex-col mx-6 my-4 pb-20 gap4">
      <div className="flex flex-col gap-4">
        <div className="text-sm text-gray-500 font-medium">
          Schrijf een review
        </div>
        <div className="text-3xl font-bold">{production?.title}</div>
        <div className="flex flex-col gap-8 pt-4">
          <div className="flex row items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleStarClick(star)}
                aria-label={`Geef ${star} ster${star > 1 ? "ren" : ""}`}
              >
                <Star
                  className={
                    star <= selectedStars
                      ? "text-yellow-500 fill-yellow-500 font-thin h-8 w-8"
                      : "text-gray-300 h-8 w-8"
                  }
                />
              </button>
            ))}
          </div>
          <div>
            <Textarea placeholder="Optioneel" className="text-sm min-h-48" />
          </div>
          <Button className="bg-stone-50 shadow-none border-2 border-red-950 text-red-950">
            Versturen
          </Button>
        </div>
      </div>
    </div>
  );
}
