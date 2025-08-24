"use client";

import { useQuery } from "convex-helpers/react/cache/hooks";
import { Authenticated, useMutation } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Crown, Ellipsis } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Page() {
  const params = useParams();
  const user = useUser();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const group = useQuery(api.groups.getGroupById, {
    id: params.id as Id<"groups">,
  });
  const groupMembers = useQuery(api.group_members.listGroupMembers, {
    groupId: params.id as Id<"groups">,
  });
  const pastVisits = useQuery(api.group_agenda.getPastGroupVisits, {
    groupId: params.id as Id<"groups">,
  });

  const deleteMembers = useMutation(api.group_members.deleteGroupMembers);
  const deleteInvitations = useMutation(
    api.group_invitations.deleteGroupInvitations,
  );
  const deleteGroup = useMutation(api.groups.deleteGroup);

  const handleDeleteGroup = async (groupId: Id<"groups">) => {
    setIsDeleting(true);
    // Redirect first to avoid timing issues
    router.push("/groups");
    // Then perform deletions
    await deleteMembers({
      groupId: groupId as Id<"groups">,
    });
    await deleteInvitations({
      groupId: groupId as Id<"groups">,
    });
    await deleteGroup({
      id: groupId as Id<"groups">,
    });
  };

  return (
    <Authenticated>
      <div className="mx-6 my-4">
        {isDeleting ? (
          <p>Groep wordt verwijderd...</p>
        ) : group ? (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col">
              {group.createdBy === user?.user?.id && (
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                        size="icon"
                      >
                        <Ellipsis />
                        <span className="sr-only">Open intellingen</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32">
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => {
                          handleDeleteGroup(group._id);
                        }}
                      >
                        Verwijderen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <div className="text-3xl font-bold">{group.name}</div>
                <div className="text-sm text-gray-400">{group.description}</div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="text-xl font-semibold">Recent bezocht</div>
              <div
                className="flex flex-row gap-4"
                style={{
                  overflowX: "auto",
                  overflowY: "hidden",
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "thin",
                }}
              >
                {pastVisits &&
                  pastVisits.map((visit) => (
                    <ProductionVisitCard
                      key={visit.productionId}
                      visit={visit}
                    />
                  ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="text-xl font-semibold">Leden</div>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Aantal: {groupMembers?.length}
                  </div>
                  {group.createdBy === user?.user?.id && (
                    <AddGroupMemberDialog groupId={params.id as string} />
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {groupMembers?.map((member) => (
                  <GroupMember
                    key={member.userId}
                    userId={member.userId}
                    isAdmin={member.userId === group.createdBy}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </Authenticated>
  );
}

type ProductionVisit = {
  productionId: string;
  date: string;
  // Add other properties if needed
};

function ProductionVisitCard({ visit }: { visit: ProductionVisit }) {
  const production = useQuery(api.productions.getProductionById, {
    id: visit.productionId as Id<"productions">,
  });

  const router = useRouter();

  const handleProductionClick = (id: Id<"productions">) => {
    router.push(`/productions/${id}`);
  };

  return (
    <Card
      className="gap-2 py-4 min-w-40 bg-stone-50 border-red-950 border-2 shadow-none rounded-none"
      onClick={() =>
        handleProductionClick(production?._id as Id<"productions">)
      }
    >
      <CardHeader className="flex flex-col gap-2">
        <CardTitle className="text-sm min-h-8 max-h-8 text-wrap">
          {production?.title?.length
            ? production.title.length > 20
              ? production.title.slice(0, 17) + "..."
              : production.title
            : "Onbekend"}
        </CardTitle>
        <div className="text-xs text-gray-800 text-medium pt-1">
          Gezien op{" "}
          {production?.start_date
            ? new Date(visit.date).toLocaleDateString("nl-NL", {
                day: "2-digit",
                month: "short",
              })
            : ""}
        </div>
      </CardHeader>
    </Card>
  );
}

function GroupMember({
  userId,
  isAdmin,
}: {
  userId: string;
  isAdmin: boolean;
}) {
  const user = useQuery(api.users.getUserById, { id: userId });
  const router = useRouter();

  const handleUserClick = (userId: string) => () => {
    router.push(`/profile/${userId}`);
  };

  return (
    <Card className="py-3" onClick={handleUserClick(userId)}>
      <CardHeader className="gap-0">
        <div className="flex flex-row items-center gap-4">
          <Avatar>
            <AvatarImage src={user?.pictureUrl || ""} alt={user?.nickname} />
            <AvatarFallback>
              <Image
                src="/default-avatar.png"
                width={8}
                height={8}
                alt={user?.nickname ? user?.nickname : "Geen foto"}
                className="w-8 h-8 rounded-full"
              />
            </AvatarFallback>
          </Avatar>
          <div className="text-sm font-medium flex flex-row items-center gap-2">
            {user?.nickname}
            {isAdmin && <Crown className="text-yellow-400 h-4 w-4" />}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

function AddGroupMemberDialog({ groupId }: { groupId: string }) {
  const outstandingInvitations = useQuery(
    api.group_invitations.getInvitationsForGroup,
    { groupId: groupId as Id<"groups"> },
  );
  const friends = useQuery(api.friendships.listFriendsForUserId);
  const groupMembers = useQuery(api.group_members.listGroupMembers, {
    groupId: groupId as Id<"groups">,
  });

  const user = useUser();

  return (
    <Dialog>
      <DialogTrigger className="bg-blue-500 text-white font-medium text-xs px-3 py-1 rounded-md">
        Uitnodigen
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle>Vrienden uitnodigen</DialogTitle>
        </DialogHeader>
        <div>
          {friends
            ?.filter((friend) => {
              const friendId =
                friend.userId1 !== user?.user?.id
                  ? friend.userId1
                  : friend.userId2;
              // Check if friend is not already a group member
              return !groupMembers?.some(
                (member) => member.userId === friendId,
              );
            })
            .map((friend) => {
              const friendId =
                friend.userId1 !== user?.user?.id
                  ? friend.userId1
                  : friend.userId2;
              return (
                <InviteFriend
                  key={friendId}
                  friendId={friendId}
                  inviteSent={
                    outstandingInvitations?.some(
                      (invitation) =>
                        invitation.userId === friendId &&
                        invitation.status === "pending",
                    ) || false
                  }
                  groupId={groupId}
                />
              );
            })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

type InviteFriendProps = {
  friendId: string;
  inviteSent: boolean;
  groupId: string;
};

function InviteFriend({ friendId, inviteSent, groupId }: InviteFriendProps) {
  const friend = useQuery(api.users.getUserById, { id: friendId });
  const sendInvite = useMutation(api.group_invitations.createInvitation);
  const createNotification = useMutation(api.notifications.createNotification);

  const user = useUser();

  const [isLoading, setLoadingState] = useState(false);
  const [inviteSentState, setInviteSentState] = useState(inviteSent);

  const handleInvite = async (friendId: string, groupId: string) => {
    setLoadingState(true);
    await sendInvite({ userId: friendId, groupId: groupId as Id<"groups"> });
    await createNotification({
      userId: friendId,
      type: "group_invitation",
      data: { groupId: groupId as Id<"groups">, senderId: user.user?.id },
    });

    setInviteSentState(true);
    setLoadingState(false);
  };

  return (
    <Card className="py-3 rounded-md mx-0">
      <CardHeader className="gap-0 px-3">
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="flex flex-row items-center gap-4">
            <Avatar>
              <AvatarImage
                src={friend?.pictureUrl || ""}
                alt={friend?.nickname}
              />
              <AvatarFallback>
                <Image
                  src="/default-avatar.png"
                  width={8}
                  height={8}
                  alt={friend?.nickname ? friend?.nickname : "Geen foto"}
                  className="w-8 h-8 rounded-full"
                />
              </AvatarFallback>
            </Avatar>
            <div className="text-sm font-medium">{friend?.nickname}</div>
          </div>
          <div className="flex justify-end">
            {inviteSentState ? (
              <span className="text-xs text-gray-500">
                Uitnodiging verzonden
              </span>
            ) : (
              <Button
                className="bg-blue-500 text-white text-xs"
                onClick={() => handleInvite(friendId, groupId)}
                disabled={isLoading}
              >
                Voeg toe
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
