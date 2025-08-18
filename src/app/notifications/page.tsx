"use client";

import { Authenticated, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Image from "next/image";
import { Ban, CircleCheck } from "lucide-react";

export default function Page() {
  return (
    <main className="flex flex-col justify-center p-2 ">
      <Authenticated>
        <Notifications />
      </Authenticated>
    </main>
  );
}

function Notifications() {
  const notifications = useQuery(
    api.notifications.getNotificationsForCurrentUser,
  );

  return (
    <>
      {notifications?.length === 0 && (
        <div className="flex items-center justify-center p-12">
          <p className="text-gray-400 text-sm">Geen meldingen</p>
        </div>
      )}
      <div>
        {notifications?.map((notification) =>
          notification.type === "friend_request" ? (
            <FriendRequest key={notification._id} notification={notification} />
          ) : null,
        )}
      </div>
    </>
  );
}

function FriendRequest({ notification }: { notification: any }) {
  const sender = useQuery(api.users.getUserById, { id: notification.data });
  const updateFriendshipStatus = useMutation(
    api.friendships.updateFriendshipStatus,
  );
  const markNotificationAsRead = useMutation(
    api.notifications.markNotificationAsRead,
  );

  const setFriendshipStatus = async (status: string) => {
    await updateFriendshipStatus({
      senderId: notification.data,
      status: status,
    });
    await markNotificationAsRead({ notificationId: notification._id });
  };

  return (
    <div className="flex items-center justify-between gap-4 p-4 border-b">
      <Image
        src={sender?.pictureUrl || "/default-avatar.png"}
        alt={sender?.nickname || "Vriend"}
        width={24}
        height={24}
        className="rounded-full"
      />
      <div className="flex flex-col gap-1">
        <p className="font-semibold">{sender?.nickname}</p>
        <p className="text-xs text-gray-500">
          Wil graag theatervriendjes worden
        </p>
      </div>
      <div className="flex flex-row gap-4">
        <CircleCheck
          className="text-green-400"
          onClick={() => setFriendshipStatus("accepted")}
        />
        <Ban
          className="text-red-400"
          onClick={() => setFriendshipStatus("declined")}
        />
      </div>
    </div>
  );
}
