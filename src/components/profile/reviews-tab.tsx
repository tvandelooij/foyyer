"use client";

import { useMutation } from "convex/react";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn, formatDateDiff } from "@/lib/utils";
import Link from "next/link";
import { Id } from "../../../convex/_generated/dataModel";
import { useCallback, useState } from "react";
import { SmilePlus } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ReactionType } from "@/lib/types";

const REACTION_EMOJIS: Record<ReactionType, string> = {
  thumbs_up: "👍",
  thumbs_down: "👎",
  heart: "❤️",
  smile: "😊",
  celebration: "🎉",
};

const REACTION_ORDER: ReactionType[] = [
  "thumbs_up",
  "thumbs_down",
  "heart",
  "smile",
  "celebration",
];

function ReactionDisplay({
  reactionCounts,
  userReactions,
  onReactionClick,
}: {
  reactionCounts: Record<ReactionType, number>;
  userReactions: ReactionType[] | undefined;
  onReactionClick: (reactionType: ReactionType) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const visibleReactions = REACTION_ORDER.filter(
    (type) => reactionCounts[type] > 0 || userReactions?.includes(type),
  );

  return (
    <div className="flex flex-row gap-2 px-6">
      {visibleReactions.map((reactionType) => {
        const count = reactionCounts[reactionType];
        const isActive = userReactions?.includes(reactionType);
        return (
          <button
            key={reactionType}
            onClick={() => onReactionClick(reactionType)}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors",
              isActive
                ? "bg-orange-100 border border-orange-300"
                : "bg-stone-100 hover:bg-stone-200 border border-transparent",
            )}
          >
            <span>{REACTION_EMOJIS[reactionType]}</span>
            {count > 0 && <span className="text-gray-600">{count}</span>}
          </button>
        );
      })}
      <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors bg-stone-100 hover:bg-stone-200 border border-transparent">
            <SmilePlus className="h-4 w-4 text-gray-500" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex gap-1">
            {REACTION_ORDER.map((reactionType) => {
              const isActive = userReactions?.includes(reactionType);
              return (
                <button
                  key={reactionType}
                  onClick={() => {
                    onReactionClick(reactionType);
                    setPickerOpen(false);
                  }}
                  className={cn(
                    "p-2 rounded-md text-lg transition-colors",
                    isActive ? "bg-orange-100" : "hover:bg-stone-100",
                  )}
                >
                  {REACTION_EMOJIS[reactionType]}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function ReviewsTab({ userId }: { userId: string }) {
  const reviewsWithDetails = useQuery(
    api.production_reviews.getAllReviewsByUserWithDetails,
    { userId },
  );

  if (!reviewsWithDetails || reviewsWithDetails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-gray-400 text-sm">Nog geen voorstellingen bezocht</p>
        <p className="text-gray-400 text-xs mt-2">
          Deel je eerste review om anderen te helpen geweldige voorstellingen te
          ontdekken
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {reviewsWithDetails.map((item) => (
        <ReviewItem key={item._id} item={item} />
      ))}
    </div>
  );
}

function ReviewItem({ item }: { item: any }) {
  const { user, review, production } = item;
  const reviewId = item._id as Id<"productionReviews">;

  const userReactions = useQuery(
    api.review_reactions.getUserReactionsForReview,
    { reviewId },
  );
  const toggleReaction = useMutation(api.review_reactions.toggleReaction);

  const handleReactionClick = useCallback(
    async (reactionType: ReactionType) => {
      await toggleReaction({ reviewId, reactionType });
    },
    [toggleReaction, reviewId],
  );

  if (!user || !review || !production) {
    return null;
  }

  const formattedRating =
    review.rating !== undefined
      ? review.rating < 2
        ? `${review.rating} ster`
        : `${review.rating} sterren`
      : "";

  const reactionCounts = review.reactionCounts ?? {
    thumbs_up: 0,
    thumbs_down: 0,
    heart: 0,
    smile: 0,
    celebration: 0,
  };

  return (
    <Card className="border-none bg-white">
      <CardHeader className="flex flex-row items-center gap-4">
        <Link href={`/profile/${user.userId}`}>
          <Avatar className="w-6 h-6">
            <AvatarImage src={user.pictureUrl} alt={user.nickname} />
          </Avatar>
        </Link>
        <div className="flex flex-row gap-2 items-center justify-between w-full">
          <div className="flex flex-row gap-2 items-center">
            <CardTitle className="text-xs">
              {review.visited && review.rating === undefined && (
                <>
                  <Link href={`/profile/${user.userId}`}>{user.nickname}</Link>{" "}
                  <span className="font-normal">heeft</span>{" "}
                  <Link href={`/productions/${production._id}`}>
                    {production.title}
                  </Link>{" "}
                  <span className="font-normal">gezien</span>
                </>
              )}
              {review.visited && review.rating !== undefined && (
                <>
                  <Link href={`/profile/${user.userId}`}>{user.nickname}</Link>{" "}
                  <span className="font-normal">
                    geeft {formattedRating} aan
                  </span>{" "}
                  <Link href={`/productions/${production._id}`}>
                    {production.title}
                  </Link>
                </>
              )}
            </CardTitle>
          </div>
          <div className="flex flex-row text-xs text-gray-500">
            {formatDateDiff(review._creationTime)}
          </div>
        </div>
      </CardHeader>
      {review.review && (
        <CardContent>
          <p className="text-xs text-gray-500">{review.review}</p>
        </CardContent>
      )}
      <ReactionDisplay
        reactionCounts={reactionCounts}
        userReactions={userReactions}
        onReactionClick={handleReactionClick}
      />
    </Card>
  );
}
