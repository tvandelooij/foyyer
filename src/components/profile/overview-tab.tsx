"use client";

import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { formatDateDiff } from "@/lib/utils";
import { Users } from "lucide-react";
import Stars from "../stars";

export function OverviewTab({ userId }: { userId: string }) {
  const reviewsWithDetails = useQuery(
    api.production_reviews.getAllReviewsByUserWithDetails,
    { userId },
  );
  const friends = useQuery(api.friendships.listFriendsWithDetailsForUser, {
    userId,
  });
  const groups = useQuery(api.group_members.getGroupsForUserId, { userId });

  // Get recent activity (last 3 reviews)
  const recentReviews = reviewsWithDetails?.slice(0, 3) || [];
  const recentFriends = friends?.slice(0, 5) || [];
  const recentGroups = groups?.slice(0, 3) || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Recent Activity */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-row items-center justify-between">
          <h2 className="text-xl font-semibold">Recente activiteit</h2>
          {recentReviews.length > 0 && (
            <Link
              href={`/profile/${userId}/visits`}
              className="text-xs text-red-950 font-semibold hover:underline"
            >
              Bekijk alles
            </Link>
          )}
        </div>

        {recentReviews.length === 0 ? (
          <p className="text-gray-400 text-sm">Nog geen activiteit</p>
        ) : (
          <div className="flex flex-col gap-3">
            {recentReviews.map((item) => (
              <ReviewCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Friends Preview */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-row items-center justify-between">
          <h2 className="text-xl font-semibold">Vrienden</h2>
          {friends && friends.length > 5 && (
            <Link
              href="#friends"
              className="text-xs text-orange-500 hover:underline"
            >
              Bekijk alles
            </Link>
          )}
        </div>

        {recentFriends.length === 0 ? (
          <p className="text-gray-400 text-sm">Nog geen vrienden</p>
        ) : (
          <div className="flex flex-row gap-2 flex-wrap">
            {recentFriends.map((friend) => (
              <Link key={friend.userId} href={`/profile/${friend.userId}`}>
                <div className="flex flex-col items-center gap-1 group">
                  <Avatar className="w-12 h-12 border-2 border-gray-200 group-hover:border-orange-500 transition-colors">
                    <AvatarImage
                      src={friend.pictureUrl || ""}
                      alt={friend.nickname}
                    />
                  </Avatar>
                  <p className="text-xs text-gray-600 group-hover:text-orange-500 transition-colors truncate max-w-[60px]">
                    {friend.nickname}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Groups Preview */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-row items-center justify-between">
          <h2 className="text-xl font-semibold">Groepen</h2>
          {groups && groups.length > 3 && (
            <Link
              href="#groups"
              className="text-xs text-orange-500 hover:underline"
            >
              Bekijk alles
            </Link>
          )}
        </div>

        {recentGroups.length === 0 ? (
          <p className="text-gray-400 text-sm">Nog geen groepen</p>
        ) : (
          <div className="flex flex-col gap-2">
            {recentGroups.map((group) =>
              group ? (
                <Link key={group._id} href={`/groups/${group._id}`}>
                  <Card className="border-none bg-stone-100 hover:bg-stone-200 transition-colors py-2">
                    <CardHeader className="flex flex-row items-center gap-3 p-3">
                      <Users className="h-5 w-5 text-red-950" />
                      <CardTitle className="text-sm font-semibold">
                        {group.name}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </Link>
              ) : null,
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewCard({ item }: { item: any }) {
  const { user, review, production } = item;

  if (!user || !review || !production) {
    return null;
  }

  return (
    <Card className="border-none bg-white">
      <CardHeader className="flex flex-row items-center gap-2">
        {/* <Drama className="h-5 w-5 text-red-950 flex-shrink-0" /> */}
        <div className="flex-1 min-w-0">
          <CardTitle className="text-sm font-medium truncate">
            <Link
              href={`/productions/${production._id}`}
              className="hover:text-orange-500"
            >
              {production.title}
            </Link>
          </CardTitle>
          <div className="flex flex-row items-center justify-between mt-1">
            <Stars n={review.rating} size={4} />
            <p className="text-xs text-gray-400">
              {formatDateDiff(review._creationTime)}
            </p>
          </div>
        </div>
      </CardHeader>
      {review.review && (
        <CardContent className="">
          <p className="text-xs text-gray-600 line-clamp-2">{review.review}</p>
        </CardContent>
      )}
    </Card>
  );
}
