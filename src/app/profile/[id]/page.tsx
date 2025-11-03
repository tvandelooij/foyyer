"use client";

import { useParams } from "next/navigation";
import { Authenticated, useMutation } from "convex/react";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Ban, CircleCheck, CirclePlus } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTab } from "@/components/profile/overview-tab";
import { FriendsTab } from "@/components/profile/friends-tab";
import { GroupsTab } from "@/components/profile/groups-tab";
import { ReviewsTab } from "@/components/profile/reviews-tab";
import { EditBioDialog } from "@/components/profile/edit-bio-dialog";

export default function ProfilePage() {
  const user = useUser();
  const params = useParams();
  const id = params.id as string;
  const userProfile = useQuery(api.users.getUserById, { id });
  const [editBioOpen, setEditBioOpen] = useState(false);

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

  const isOwnProfile = user?.user?.id === id;

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

  // Calculate member since date
  const memberSince = new Date(userProfile.updatedAt);
  const monthYear = memberSince.toLocaleDateString("nl-NL", {
    month: "long",
    year: "numeric",
  });

  return (
    <Authenticated>
      <div className="mx-6 my-4 pb-20">
        {/* Profile Header */}
        <div className="flex flex-col gap-4 border-b pb-6">
          <div className="flex flex-row items-start gap-4">
            {/* Profile Picture */}
            <div className="relative w-[100px] h-[100px] rounded-full overflow-hidden border-2 border-gray-300 shadow-sm flex-shrink-0">
              <Image
                src={userProfile.pictureUrl || "/default-avatar.png"}
                alt={userProfile.nickname}
                fill
                className="object-cover"
                sizes="100px"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-row items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold truncate">
                    {userProfile.nickname}
                  </h1>
                  <p className="text-xs text-gray-500">Lid sinds {monthYear}</p>
                </div>

                {/* Action Button */}
                {isOwnProfile ? (
                  // <Button
                  //   className="text-xs rounded-sm font-semibold bg-stone-200 border-2 border-red-950 border-b-4 border-r-4 text-red-950"
                  //   onClick={() => setEditBioOpen(true)}
                  //   size="sm"
                  // >
                  //   <Edit className="h-4 w-4 mr-1" />
                  //   Bewerk
                  // </Button>
                  <></>
                ) : (
                  <>
                    {!friendship && (
                      <Button
                        className="text-xs rounded-sm font-semibold bg-orange-500 border-2 border-red-950 border-b-4 border-r-4"
                        onClick={handleAddFriend}
                        size="sm"
                      >
                        <CirclePlus className="h-4 w-4 mr-1" />
                        Toevoegen
                      </Button>
                    )}
                    {friendship?.status === "pending" &&
                      friendship?.userId1 !== id && (
                        <div className="flex items-center p-2 text-white text-xs rounded-sm font-semibold bg-gray-300 border-2 border-red-950 border-b-4 border-r-4">
                          Verzoek verzonden
                        </div>
                      )}
                  </>
                )}
              </div>

              {/* Bio */}
              {/* {userProfile.bio && (
                <p className="text-sm text-gray-700 mt-2">
                  {userProfile.bio}
                </p>
              )}
              {!userProfile.bio && isOwnProfile && (
                <p className="text-sm text-gray-400 italic mt-2">
                  Voeg een bio toe om anderen meer over jezelf te vertellen
                </p>
              )} */}
            </div>
          </div>

          {/* Accept/Decline Friend Request */}
          {friendship?.status === "pending" && friendship?.userId1 === id && (
            <div className="flex flex-row gap-4 justify-center">
              <Button
                className="bg-lime-200 border-2 border-red-950 border-b-4 border-r-4 text-red-950 rounded-sm"
                onClick={() => setFriendshipStatus("accepted")}
              >
                <CircleCheck className="h-4 w-4 mr-1" />
                Accepteren
              </Button>
              <Button
                className="bg-stone-200 border-2 border-red-950 border-b-4 border-r-4 text-red-950 rounded-sm"
                onClick={() => setFriendshipStatus("declined")}
              >
                <Ban className="h-4 w-4 mr-1" />
                Weigeren
              </Button>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-2">
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-red-950">
                {totalFriends}
              </div>
              <div className="text-xs text-gray-500">Vrienden</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-red-950">
                {visitCount}
              </div>
              <div className="text-xs text-gray-500">Bezocht</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-red-950">
                {groupCount?.length || 0}
              </div>
              <div className="text-xs text-gray-500">Groepen</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="grid w-full grid-cols-4 bg-stone-50 rounded-sm">
            <TabsTrigger
              value="overview"
              className="
                data-[state=active]:bg-orange-500
                data-[state=active]:text-white
                data-[state=active]:border-2
                data-[state=active]:border-b-4
                data-[state=active]:border-r-4
                data-[state=active]:border-red-950
                rounded-sm
                text-xs
                font-semibold
              "
            >
              Overzicht
            </TabsTrigger>
            <TabsTrigger
              value="friends"
              className="
                data-[state=active]:bg-orange-500
                data-[state=active]:text-white
                data-[state=active]:border-2
                data-[state=active]:border-b-4
                data-[state=active]:border-r-4
                data-[state=active]:border-red-950
                rounded-sm
                text-xs
                font-semibold
              "
            >
              Vrienden
            </TabsTrigger>
            <TabsTrigger
              value="groups"
              className="
                data-[state=active]:bg-orange-500
                data-[state=active]:text-white
                data-[state=active]:border-2
                data-[state=active]:border-b-4
                data-[state=active]:border-r-4
                data-[state=active]:border-red-950
                rounded-sm
                text-xs
                font-semibold
              "
            >
              Groepen
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="
                data-[state=active]:bg-orange-500
                data-[state=active]:text-white
                data-[state=active]:border-2
                data-[state=active]:border-b-4
                data-[state=active]:border-r-4
                data-[state=active]:border-red-950
                rounded-sm
                text-xs
                font-semibold
              "
            >
              Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <OverviewTab userId={id} />
          </TabsContent>

          <TabsContent value="friends" className="mt-6">
            <FriendsTab userId={id} />
          </TabsContent>

          <TabsContent value="groups" className="mt-6">
            <GroupsTab userId={id} />
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <ReviewsTab userId={id} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Bio Dialog */}
      <EditBioDialog
        open={editBioOpen}
        onOpenChange={setEditBioOpen}
        currentBio={userProfile.bio}
      />
    </Authenticated>
  );
}
