"use client";

import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "../../../convex/_generated/api";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { formatDateDiff } from "@/lib/utils";

export function FriendsTab({ userId }: { userId: string }) {
  const friends = useQuery(api.friendships.listFriendsWithDetailsForUser, {
    userId,
  });

  if (!friends || friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-gray-400 text-sm">Nog geen vrienden</p>
        <p className="text-gray-400 text-xs mt-2">
          Start met het opbouwen van je theaternetwerk! Vind vrienden om reviews
          te delen en bezoeken te plannen.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {friends.map((friend) => (
        <Link key={friend.userId} href={`/profile/${friend.userId}`}>
          <Card className="border-none bg-white py-2">
            <CardHeader className="flex flex-row items-center gap-4 p-4">
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src={friend.pictureUrl || ""}
                  alt={friend.nickname}
                />
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-sm font-semibold">
                  {friend.nickname}
                </CardTitle>
                <p className="text-xs text-gray-500">
                  Vrienden sinds {formatDateDiff(friend.friendsSince)}
                </p>
              </div>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}
