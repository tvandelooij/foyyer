"use client";

import { usePaginatedQuery } from "convex-helpers/react/cache/hooks";
import { api } from "../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { formatDateDiff } from "@/lib/utils";
import Link from "next/link";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";

export function FeedClient({ userId }: { userId: string }) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.feed.getItemsForUserPaginatedWithDetails,
    { userId },
    { initialNumItems: 10 },
  );

  const { loaderRef } = useInfiniteScroll({
    status,
    loadMore,
    itemsPerPage: 10,
  });

  return (
    <>
      {results?.length === 0 && status !== "LoadingFirstPage" && (
        <div className="mx-auto my-auto">
          <div className="text-red-950 text-xs">
            Maak snel vrienden om hun activiteit hier te zien!
          </div>
        </div>
      )}
      <div className="flex flex-col gap-2">
        {results?.map((item) => (
          <FeedItemComponent key={item._id} item={item} />
        ))}
        <div ref={loaderRef} />
        {status === "LoadingMore" && (
          <div className="text-center text-xs text-stone-400 py-4">
            Meer activiteit aan het laden...
          </div>
        )}
      </div>
    </>
  );
}

function FeedItemComponent({ item }: { item: any }) {
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
