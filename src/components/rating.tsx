import { useMutation } from "convex/react";
import { useQuery } from "convex-helpers/react/cache/hooks";
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
    visited: boolean;
  };
};

export default function Rating({ production, maybeReview }: RatingProps) {
  const user = useUser();

  const addReview = useMutation(api.production_reviews.createReview);
  const updateRating = useMutation(api.production_reviews.updateRating);

  const createFeedItem = useMutation(api.feed.createFeedItem);
  const deleteFeedItem = useMutation(api.feed.deleteFeedItem);
  const maybeFeedItem = useQuery(api.feed.getFeedItemFromUserByProduction, {
    userId: user.user?.id as string,
    productionId: production._id as Id<"productions">,
    type: "review",
  });

  const updateProductionStats = useMutation(
    api.productions.updateProductionStats,
  );

  const handleStarClick = async (star: number) => {
    const prevRating = maybeReview?.rating ?? 0;
    const isRemoving = star === prevRating;
    const newRating = isRemoving ? 0 : star;
    const currentAvg = production?.avg_rating ?? 0;
    const currentCount = production?.rating_count ?? 0;
    const visited = isRemoving ? false : true;

    if (maybeReview) {
      await updateRating({
        id: maybeReview._id,
        rating: newRating,
        visited: visited,
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

        // Remove feed item if it exists
        if (maybeFeedItem && maybeFeedItem[0]?._id) {
          await deleteFeedItem({
            id: maybeFeedItem[0]._id,
          });
        }
      } else if (prevRating === 0) {
        // First time rating: add to total, increase count
        newAvg = (currentAvg * currentCount + newRating) / (currentCount + 1);
        newCount = currentCount + 1;

        // Create feed item if it doesn't exist
        if (!maybeFeedItem || maybeFeedItem.length === 0) {
          await createFeedItem({
            userId: user.user?.id as string,
            type: "review",
            data: {
              productionId: production._id as Id<"productions">,
              reviewId: maybeReview._id,
            },
          });
        } else {
          // If a feed item exists (e.g., from marking as visited), update it with the reviewId
          await updateRating({
            id: maybeReview._id,
            rating: newRating,
            visited: visited,
          });
        }
      } else {
        // Update rating: adjust total, count stays the same
        newAvg =
          (currentAvg * currentCount - prevRating + newRating) / currentCount;
        // If there is no feed item (e.g., after removal and re-rate), create it
        if (!maybeFeedItem || maybeFeedItem.length === 0) {
          await createFeedItem({
            userId: user.user?.id as string,
            type: "review",
            data: {
              productionId: production._id as Id<"productions">,
              reviewId: maybeReview._id,
            },
          });
        }
      }

      await updateProductionStats({
        id: production?._id as Id<"productions">,
        avg_rating: newAvg,
        rating_count: newCount,
        review_count: production?.review_count ?? 0,
      });
    } else {
      // First review for this user
      const review = await addReview({
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

      await createFeedItem({
        userId: user.user?.id as string,
        type: "review",
        data: {
          productionId: production._id as Id<"productions">,
          reviewId: review,
        },
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
                ? "text-red-950 fill-red-950 font-thin h-8 w-8"
                : "text-red-950 h-8 w-8"
            }
          />
        </button>
      ))}
    </div>
  );
}
