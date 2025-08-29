"use client";

import { useParams } from "next/navigation";
import { Authenticated, useMutation } from "convex/react";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import Image from "next/image";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ban, CircleCheck, CirclePlus } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function ProfilePage() {
  const user = useUser();
  const params = useParams();
  const id = params.id as Id<"users">;
  const userProfile = useQuery(api.users.getUserById, { id });

  const addFriend = useMutation(api.friendships.createFriendship);
  const createNotification = useMutation(api.notifications.createNotification);
  const friendship = useQuery(api.friendships.getFriendship, {
    userId: user.user?.id as string,
    friendId: id,
  });
  const totalFriends = useQuery(api.friendships.getTotalFriends, {
    userId: id,
  });
  const visitCount = useQuery(api.users.getTotalVisitCountForUser, {
    userId: id,
  });
  const groupCount = useQuery(api.group_members.getGroupsForUserId, {
    userId: id,
  });

  const updateFriendshipStatus = useMutation(
    api.friendships.updateFriendshipStatus,
  );
  const notificationId = useQuery(
    api.notifications.getNotificationIdForFriendship,
    {
      userId: friendship?.userId2 as Id<"users">,
      data: {
        senderId: friendship?.userId1 as Id<"users">,
      },
    },
  );
  const markNotificationAsRead = useMutation(
    api.notifications.markNotificationAsRead,
  );

  if (!userProfile) return <div>Loading...</div>;

  const handleAddFriend = async () => {
    await addFriend({ userId: params.id as string });
    await createNotification({
      userId: params.id as string,
      type: "friend_request",
      data: { senderId: userProfile._id },
    });
  };

  const setFriendshipStatus = async (status: string) => {
    if (!friendship?.userId2) {
      throw new Error("friendship.userId2 is undefined");
    }
    await updateFriendshipStatus({
      senderId: id,
      status: status,
    });

    if (notificationId) {
      await markNotificationAsRead({
        notificationId: notificationId as Id<"notifications">,
      });
    }
  };

  return (
    <Authenticated>
      <div className="items-center justify-items-center min-h-screen p-4 gap-16 sm:p-20 pb-20">
        <div className="border-b pb-4">
          <div className="flex flex-col items-center gap-2 pb-4">
            <Image
              src={userProfile.pictureUrl || "/default-avatar.png"}
              alt={userProfile.nickname}
              width={150}
              height={150}
              className="rounded-full object-cover border-2 border-gray-300 shadow-sm"
            />
            <div className="text-2xl font-bold">
              <p>{userProfile.nickname}</p>
            </div>
          </div>
          <div className="flex justify-end">
            {!friendship && id != user?.user?.id && (
              <Button
                className="text-xs rounded-sm font-semibold bg-orange-500 border-2 border-red-950 border-b-4 border-r-4 "
                onClick={handleAddFriend}
              >
                <div className="flex flex-row items-center gap-2">
                  <CirclePlus />
                  <div>Toevoegen</div>
                </div>
              </Button>
            )}
            {friendship?.status === "pending" && friendship?.userId1 !== id && (
              <div className="flex items-center p-2 text-white text-xs rounded-sm font-semibold bg-gray-300 border-2 border-red-950 border-b-4 border-r-4">
                <div>Verzoek verzonden</div>
              </div>
            )}
          </div>
          {friendship?.status === "pending" && friendship?.userId1 === id && (
            <div className="flex flex-row gap-4 justify-center">
              <CircleCheck
                className="text-green-400"
                onClick={() => setFriendshipStatus("accepted")}
              />
              <Ban
                className="text-red-400"
                onClick={() => setFriendshipStatus("declined")}
              />
            </div>
          )}
        </div>
        <div className="grid md:grid-cols-3 gap-4 pt-4">
          <Card className="@container/card rounded-sm bg-stone-100">
            <CardHeader>
              <CardDescription>Vrienden</CardDescription>
              <CardTitle className="text-xl">{totalFriends}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="@container/card rounded-sm bg-stone-100">
            <CardHeader>
              <CardDescription>Voorstellingen bezocht</CardDescription>
              <CardTitle className="text-xl">{visitCount}</CardTitle>
            </CardHeader>
          </Card>

          <Card className="@container/card rounded-sm bg-stone-100">
            <CardHeader>
              <CardDescription>Groepen</CardDescription>
              <CardTitle className="text-xl">{groupCount?.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    </Authenticated>
  );
}
