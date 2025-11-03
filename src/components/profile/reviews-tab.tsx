"use client";

import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { formatDateDiff } from "@/lib/utils";
import Link from "next/link";

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

  if (!user || !review || !production) {
    return null;
  }

  const formattedRating =
    review.rating !== undefined
      ? review.rating < 2
        ? `${review.rating} ster`
        : `${review.rating} sterren`
      : "";

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
    </Card>
  );
}
