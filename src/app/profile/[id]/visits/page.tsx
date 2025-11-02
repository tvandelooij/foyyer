"use client";

import { useQuery } from "convex-helpers/react/cache/hooks";
import { Authenticated } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { formatDateDiff } from "@/lib/utils";
import Link from "next/link";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const userProfile = useQuery(api.users.getUserById, { id });
  const reviewsWithDetails = useQuery(
    api.production_reviews.getAllReviewsByUserWithDetails,
    { userId: id },
  );

  return (
    <Authenticated>
      <div className="my-4">
        <div className="flex flex-col gap-6">
          <div className="mx-6 text-2xl font-bold">
            Bezocht door {userProfile?.nickname}
          </div>
          <div className="flex flex-col gap-4">
            {reviewsWithDetails?.map((item) => (
              <ReviewItem key={item._id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </Authenticated>
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
    <Card className="border-none">
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
