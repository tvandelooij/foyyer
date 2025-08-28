"use client";

import { Authenticated, useMutation } from "convex/react";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "../../../convex/_generated/api";
import Image from "next/image";
import { Ban, CircleArrowRight, CircleCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Page() {
  return (
    <main className="flex flex-col justify-center mx-6 my-4">
      <Authenticated>
        <div className="text-3xl font-bold">Meldingen</div>
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
        {notifications?.map((notification) => {
          if (notification.type === "friend_request") {
            return (
              <FriendRequest
                key={notification._id}
                notification={notification}
              />
            );
          } else if (notification.type === "group_invitation") {
            return (
              <GroupInvitation
                key={notification._id}
                notification={notification}
              />
            );
          } else if (notification.type === "event_proposal") {
            return (
              <EventProposal
                key={notification._id}
                notification={notification}
              />
            );
          } else {
            return null;
          }
        })}
      </div>
    </>
  );
}

function FriendRequest({ notification }: { notification: any }) {
  const router = useRouter();
  const id = notification.data.senderId;
  const sender = useQuery(api.users.getUserById, { id });
  const updateFriendshipStatus = useMutation(
    api.friendships.updateFriendshipStatus,
  );
  const markNotificationAsRead = useMutation(
    api.notifications.markNotificationAsRead,
  );

  const setFriendshipStatus = async (status: string) => {
    await updateFriendshipStatus({
      senderId: id,
      status: status,
    });
    await markNotificationAsRead({ notificationId: notification._id });
  };

  const handleProfileClick = () => {
    router.push(`/profile/${sender?.userId}`);
  };

  return (
    <div className="flex items-center justify-between gap-4 p-4 border-b">
      <Image
        src={sender?.pictureUrl || "/default-avatar.png"}
        alt={sender?.nickname || "Vriend"}
        width={40}
        height={40}
        className="rounded-full"
        onClick={() => handleProfileClick()}
      />
      <div className="flex flex-col gap-1">
        <p className="font-semibold" onClick={() => handleProfileClick()}>
          {sender?.nickname}
        </p>
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

function GroupInvitation({ notification }: { notification: any }) {
  const router = useRouter();
  const id = notification.data.senderId;

  const sender = useQuery(api.users.getUserById, { id });
  const groupName = useQuery(api.groups.getGroupNameById, {
    id: notification.data.groupId,
  });

  const processGroupInvitation = useMutation(
    api.group_invitations.updateInvitation,
  );
  const markNotificationAsRead = useMutation(
    api.notifications.markNotificationAsRead,
  );

  const handleProfileClick = () => {
    router.push(`/profile/${sender?.userId}`);
  };

  const handleGroupInvite = async (status: string) => {
    await processGroupInvitation({
      groupId: notification.data.groupId,
      status: status,
    });

    await markNotificationAsRead({ notificationId: notification._id });
  };

  return (
    <div className="flex flex-col p-4 border-b">
      <div className="flex flex-row items-center gap-4">
        <Image
          src={sender?.pictureUrl || "/default-avatar.png"}
          alt={sender?.nickname || "Vriend"}
          width={40}
          height={40}
          className="rounded-full"
          onClick={() => handleProfileClick()}
        />
        <div className="flex flex-col gap-1">
          <p className="text-xs text-gray-500 text-nowrap">
            <span className="font-semibold">{sender?.nickname}</span> heeft je
            uitgenodigd voor
          </p>
          <span
            className="text-sm font-semibold text-gray-800"
            onClick={() => router.push(`/groups/${notification.data.groupId}`)}
          >
            {groupName}
          </span>
        </div>
      </div>
      <div className="flex flex-row justify-end gap-4">
        <CircleCheck
          className="text-green-400"
          onClick={() => handleGroupInvite("accepted")}
        />
        <Ban
          className="text-red-400"
          onClick={() => handleGroupInvite("declined")}
        />
      </div>
    </div>
  );
}

function EventProposal({ notification }: { notification: any }) {
  const router = useRouter();
  const id = notification.data.senderId;

  const sender = useQuery(api.users.getUserById, { id });
  const groupName = useQuery(api.groups.getGroupNameById, {
    id: notification.data.groupId,
  });

  const production = useQuery(api.productions.getProductionById, {
    id: notification.data.productionId,
  });
  const agendaItem = useQuery(api.user_agenda.getEventProposal, {
    groupId: notification.data.groupId,
    productionId: notification.data.productionId,
  });

  const markNotificationAsRead = useMutation(
    api.notifications.markNotificationAsRead,
  );

  const handleAgendaItemClick = async () => {
    await markNotificationAsRead({ notificationId: notification?._id });
    router.push(`/agenda/${agendaItem?._id}`);
  };

  return (
    <div className="flex flex-col p-4 border-b">
      <div className="flex flex-row items-center gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-400">
            <span className="font-semibold">{sender?.nickname}</span> heeft een
            voorstelling op de agenda gezet voor{" "}
            <span className="font-semibold">{groupName}</span>
          </p>
          <div className="text-sm font-bold">{production?.title}</div>
          <div
            className="flex flex-row justify-end"
            onClick={() => handleAgendaItemClick()}
          >
            <CircleArrowRight className="text-red-950" />
          </div>
        </div>
      </div>
    </div>
  );
}
