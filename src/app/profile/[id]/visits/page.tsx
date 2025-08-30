"use client";

import { useQuery } from "convex-helpers/react/cache/hooks";
import { Authenticated } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { formatDateDiff } from "@/lib/utils";
import { Id } from "../../../../../convex/_generated/dataModel";
import Link from "next/link";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const userProfile = useQuery(api.users.getUserById, { id });
  const reviews = useQuery(api.production_reviews.getAllReviewsByUser, {
    userId: id,
  });

  const feedItems: FeedItem[] = reviews
    ? reviews.map((review) => ({
        _id: review._id,
        userId: review.userId,
        type: "review",
        data: {
          productionId: review.productionId,
          reviewId: review._id,
        },
      }))
    : [];

  return (
    <Authenticated>
      <div className="mx-6 my-4">
        <div className="flex flex-col gap-6">
          <div className="text-2xl font-bold">
            Bezocht door {userProfile?.nickname}
          </div>
          <div className="flex flex-col gap-4">
            {feedItems?.map((item) => (
              <FeedItem key={item._id} feedItem={item} />
            ))}
          </div>
        </div>
      </div>
    </Authenticated>
  );
}

type FeedItem = {
  _id: string;
  userId: string;
  type: "review";
  data: {
    productionId: string;
    reviewId: string;
  };
};

function FeedItem({ feedItem }: { feedItem: FeedItem }) {
  const user = useQuery(api.users.getUserById, { id: feedItem.userId });
  const review = useQuery(
    api.production_reviews.getReviewsForProductionByUser,
    {
      productionId: feedItem.data.productionId as Id<"productions">,
      userId: feedItem.userId,
    },
  );
  const production = useQuery(api.productions.getProductionById, {
    id: feedItem.data.productionId as Id<"productions">,
  });

  return (
    <Card className="border-none">
      <CardHeader className="flex flex-row items-center gap-4">
        <Link href={`/profile/${user?.userId}`}>
          <Avatar className="w-6 h-6">
            <AvatarImage src={user?.pictureUrl} alt={user?.nickname} />
          </Avatar>
        </Link>
        <div className="flex flex-row gap-2 items-center justify-between w-full">
          <div className="flex flex-row gap-2 items-center">
            <CardTitle className="text-xs">
              {user && review && production && (
                <FeedText
                  user={{ userId: user.userId, nickname: user.nickname }}
                  review={{ visited: review.visited, rating: review.rating }}
                  production={{ _id: production._id, title: production.title }}
                />
              )}
            </CardTitle>
          </div>
          <div className="flex flex-row text-xs text-gray-500">
            {formatDateDiff(review?._creationTime as number)}
          </div>
        </div>
      </CardHeader>
      {review?.review && (
        <CardContent>
          <p className="text-xs text-gray-500">{review.review}</p>
        </CardContent>
      )}
    </Card>
  );
}

type FeedTextProps = {
  user: { userId: string; nickname: string };
  review: { visited: boolean; rating?: number };
  production: { _id: string; title: string };
};

function FeedText({ user, review, production }: FeedTextProps) {
  const formattedRating =
    review.rating !== undefined
      ? review.rating < 2
        ? `${review.rating} ster`
        : `${review.rating} sterren`
      : "";

  return (
    <>
      {review.visited && review.rating === undefined && (
        <>
          <Link href={`/profile/${user?.userId}`}>{user?.nickname}</Link>{" "}
          <span className="font-normal">heeft</span>{" "}
          <Link href={`/productions/${production?._id}`}>
            {production?.title}
          </Link>{" "}
          <span className="font-normal">gezien</span>
        </>
      )}
      {review.visited && review.rating !== undefined && (
        <>
          <Link href={`/profile/${user?.userId}`}>{user?.nickname}</Link>{" "}
          <span className="font-normal">geeft {formattedRating} aan</span>{" "}
          <Link href={`/productions/${production?._id}`}>
            {production?.title}
          </Link>
        </>
      )}
    </>
  );
}
