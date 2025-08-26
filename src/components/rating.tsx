import { useMutation } from "convex/react";
import { Star } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";

type RatingProps = {
  production: {
    _id: string;
    avg_rating: number;
    rating_count: number;
    review_count: number;
  };
  maybeReview?: {
    _id: Id<"productionReviews">;
    rating: number;
  };
};

export default function Rating({ production, maybeReview }: RatingProps) {
  const user = useUser();

  const addReview = useMutation(api.production_reviews.createReview);
  const updateRating = useMutation(api.production_reviews.updateRating);

  const updateProductionStats = useMutation(
    api.productions.updateProductionStats,
  );

  const handleStarClick = async (star: number) => {
    const prevRating = maybeReview?.rating ?? 0;
    const isRemoving = star === prevRating;
    const newRating = isRemoving ? 0 : star;
    const currentAvg = production?.avg_rating ?? 0;
    const currentCount = production?.rating_count ?? 0;

    if (maybeReview) {
      await updateRating({
        id: maybeReview._id,
        rating: newRating,
      });

      let newAvg = currentAvg;
      let newCount = currentCount;

      if (isRemoving) {
        // Remove rating: subtract user's rating from total, decrease count
        if (currentCount > 1) {
          newAvg =
            (currentAvg * currentCount - prevRating) / (currentCount - 1);
        } else {
          newAvg = 0;
        }
        newCount = currentCount - 1;
      } else if (prevRating === 0) {
        // First time rating: add to total, increase count
        newAvg = (currentAvg * currentCount + newRating) / (currentCount + 1);
        newCount = currentCount + 1;
      } else {
        // Update rating: adjust total, count stays the same
        newAvg =
          (currentAvg * currentCount - prevRating + newRating) / currentCount;
      }

      await updateProductionStats({
        id: production?._id as Id<"productions">,
        avg_rating: newAvg,
        rating_count: newCount,
        review_count: production?.review_count ?? 0,
      });
    } else {
      // First review for this user
      await addReview({
        visited: true,
        productionId: production._id as Id<"productions">,
        rating: newRating,
        userId: user.user?.id as string,
      });

      const newCount = (production?.rating_count ?? 0) + 1;
      const currentAvg = production?.avg_rating ?? 0;
      const newAvg = (currentAvg * (newCount - 1) + newRating) / newCount;

      await updateProductionStats({
        id: production?._id as Id<"productions">,
        avg_rating: newAvg,
        rating_count: newCount,
        review_count: production?.review_count ?? 0,
      });
    }
  };

  return (
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
              star <= (maybeReview?.rating ?? 0)
                ? "text-yellow-500 fill-yellow-500 font-thin h-8 w-8"
                : "text-gray-300 h-8 w-8"
            }
          />
        </button>
      ))}
    </div>
  );
}
