"use client";

import {
  Authenticated,
  Unauthenticated,
  useConvexAuth,
  useMutation,
} from "convex/react";
import { api } from "../../convex/_generated/api";
import { useQuery } from "convex-helpers/react/cache/hooks";

import { SignInButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Id } from "../../convex/_generated/dataModel";
import { formatDateDiff } from "@/lib/utils";
import Link from "next/link";

export default function Home() {
  const auth = useConvexAuth();
  const createUser = useMutation(api.users.createUser);
  const { user } = useUser();

  if (auth.isAuthenticated) {
    // add user data to convex and set user state
    createUser();
  }

  return (
    <div className="flex flex-col mx-6 my-4 pb-20 gap-4 pb-20 sm:p-2 dark:bg-gray-900 dark:border-gray-700">
      <main className="flex flex-col items-center sm:items-start">
        <Unauthenticated>
          <SignInButton>
            <Button className="bg-orange-500 border-red-950 border-2 border-b-4 border-r-4 font-semibold text-white p-4">
              Log in
            </Button>
          </SignInButton>
        </Unauthenticated>
        <Authenticated>
          <div className="flex flex-col w-full">
            <Feed userId={user?.id} />
          </div>
        </Authenticated>
      </main>
    </div>
  );
}

type FeedProps = {
  userId: string | undefined;
};

function Feed({ userId }: FeedProps) {
  const feedItems = useQuery(api.feed.getItemsForUser, {
    userId: userId as string,
  });
  return (
    <div className="flex flex-col gap-4">
      {feedItems?.map((item) => (
        <FeedItem key={item._id} feedItem={item} />
      ))}
    </div>
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

  const formattedRating =
    review?.rating !== undefined
      ? review.rating < 2
        ? `${review.rating} ster`
        : `${review.rating} sterren`
      : "";

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
              <Link href={`/profile/${user?.userId}`}>{user?.nickname}</Link>{" "}
              <span className="font-normal">geeft {formattedRating} aan</span>{" "}
              <Link href={`/productions/${production?._id}`}>
                {production?.title}
              </Link>
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
