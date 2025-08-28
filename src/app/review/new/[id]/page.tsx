"use client";

import { useParams, useRouter } from "next/navigation";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "../../../../../convex/_generated/api";
import { useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Rating from "@/components/rating";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as Id<"productions">;
  const user = useUser();

  const production = useQuery(api.productions.getProductionById, { id: id });
  const maybeReview = useQuery(
    api.production_reviews.getReviewsForProductionByUser,
    { productionId: id },
  );

  const createReview = useMutation(api.production_reviews.createReview);
  const updateReview = useMutation(api.production_reviews.updateReview);

  const [reviewText, setReviewText] = useState("");
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (maybeReview?.review !== undefined) {
      setReviewText(maybeReview.review ?? "");
      setEditMode(false);
    } else {
      setReviewText("");
      setEditMode(true);
    }
  }, [maybeReview]);

  const handleButtonClick = async () => {
    if (!user.user) return;
    if (maybeReview && !editMode) {
      // Enable editing
      setEditMode(true);
    } else if (maybeReview && editMode) {
      // Update review
      await updateReview({ id: maybeReview._id, review: reviewText });
      setEditMode(false);
      router.back();
    } else {
      // Create review
      await createReview({
        productionId: id,
        userId: user.user.id,
        visited: true,
        rating: maybeReview?.rating ?? 0,
        review: reviewText,
      });
      setEditMode(false);
      router.back();
    }
  };

  const handleBackClick = () => {
    router.back();
  };

  return (
    <div className="flex flex-col mx-6 my-4 pb-20 gap4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-row items-center gap-4">
          <ArrowLeft
            className="text-gray-500 h-6 w-6"
            onClick={handleBackClick}
          />
          <div className="text-sm text-gray-500 font-medium">
            Schrijf een review
          </div>
        </div>
        <div className="text-3xl font-bold">{production?.title}</div>
        <div className="flex flex-col gap-8 pt-4">
          {production && (
            <Rating
              production={{
                _id: production!._id,
                avg_rating: production?.avg_rating ?? 0,
                rating_count: production?.rating_count ?? 0,
                review_count: production?.review_count ?? 0,
              }}
              maybeReview={
                maybeReview
                  ? { _id: maybeReview._id, rating: maybeReview.rating ?? 0 }
                  : undefined
              }
            />
          )}
          <div>
            <Textarea
              placeholder="Optioneel"
              className="text-sm min-h-48 border-2 border-red-950"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              disabled={!editMode}
            />
          </div>
          <Button
            className="bg-lime-200 rounded-xs font-semibold shadow-none border-2 border-b-4 border-r-4 border-red-950 text-red-950"
            onClick={handleButtonClick}
          >
            {maybeReview ? (editMode ? "Opslaan" : "Bewerken") : "Plaatsen"}
          </Button>
        </div>
      </div>
    </div>
  );
}
