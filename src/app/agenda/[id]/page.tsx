"use client";

import { useParams, useRouter } from "next/navigation";
import { Id } from "../../../../convex/_generated/dataModel";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "../../../../convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMutation } from "convex/react";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Ellipsis } from "lucide-react";
import { useState } from "react";

export default function Page() {
  const user = useUser();
  const params = useParams();
  const router = useRouter();

  const id = params.id as Id<"userAgenda">;

  const [isDeleting, setIsDeleting] = useState(false);

  const updateAgendaItemStatus = useMutation(
    api.user_agenda.updateAgendaItemStatus,
  );
  const deleteAgendaItem = useMutation(api.user_agenda.deleteAgendaItem);

  const agendaItem = useQuery(api.user_agenda.getAgendaItem, { id });
  const production = useQuery(
    api.productions.getProductionById,
    agendaItem?.productionId
      ? { id: agendaItem.productionId as Id<"productions"> }
      : "skip",
  );
  const venue = useQuery(
    api.venues.getVenueById,
    agendaItem?.venueId
      ? { venueId: agendaItem.venueId as Id<"venues"> }
      : "skip",
  );

  const handleStatusUpdate = async (
    status: "planned" | "confirmed" | "canceled",
  ) => {
    await updateAgendaItemStatus({ id, status });
  };

  const handleDeleteAgendaItem = async (id: Id<"userAgenda">) => {
    setIsDeleting(true);

    router.push("/agenda");
    await deleteAgendaItem({ id });
  };

  const handleProductionInfoClick = (productionId: Id<"productions">) => {
    router.push(`/productions/${productionId}`);
  };

  return (
    <div className="flex flex-col mx-6 my-4 pb-20 gap-4">
      {isDeleting ? (
        <p>Groep wordt verwijderd...</p>
      ) : agendaItem ? (
        <div className="flex flex-col gap-4">
          {agendaItem?.userId === user?.user?.id && (
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
                    onClick={() =>
                      handleProductionInfoClick(agendaItem?.productionId)
                    }
                  >
                    Meer info
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => {
                      handleDeleteAgendaItem(
                        agendaItem?._id as Id<"userAgenda">,
                      );
                    }}
                  >
                    Verwijderen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          <div className="text-3xl font-bold">{production?.title}</div>

          <div>
            <Card className="border-none">
              <CardHeader>
                <CardDescription>
                  <div className="flex flex-col gap-2">
                    <div className="text-base text-black font-semibold">
                      {agendaItem?.date
                        ? new Date(agendaItem.date).toLocaleDateString(
                            "nl-NL",
                            {
                              day: "2-digit",
                              month: "short",
                            },
                          )
                        : ""}
                      , {agendaItem?.start_time.slice(0, 5)}
                    </div>
                    <div className="text-xs">{venue?.name}</div>
                  </div>
                </CardDescription>
              </CardHeader>
              {agendaItem?.groupId && (
                <CardContent>
                  <div className="flex flex-row justify-end">
                    <Select
                      value={
                        agendaItem?.status === "planned"
                          ? undefined
                          : agendaItem?.status
                      }
                      onValueChange={(value) =>
                        handleStatusUpdate(
                          value as "planned" | "confirmed" | "canceled",
                        )
                      }
                    >
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Geef aan of je meegaat" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmed">Ik ga mee</SelectItem>
                        <SelectItem value="canceled">Ik kan niet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
          {agendaItem?.groupId && (
            <GroupMembers
              groupId={agendaItem?.groupId as Id<"groups">}
              productionId={agendaItem?.productionId as Id<"productions">}
            />
          )}
        </div>
      ) : (
        <p>Geen agenda-item gevonden.</p>
      )}
    </div>
  );
}

function GroupMembers({
  groupId,
  productionId,
}: {
  groupId: Id<"groups">;
  productionId: Id<"productions">;
}) {
  const memberItems = useQuery(api.user_agenda.getAgendaItemsForGroup, {
    groupId,
    productionId,
  });
  const group = useQuery(api.groups.getGroupById, { id: groupId });

  return (
    <Card className="border-none gap-3">
      <CardHeader>
        <CardTitle className="text-sm">{group?.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {memberItems?.map((item) => (
            <MemberStatus
              key={item._id}
              userId={item.userId}
              status={item.status}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function MemberStatus({ userId, status }: { userId: string; status: string }) {
  const user = useQuery(api.users.getUserById, { id: userId });
  return (
    <div className="flex flex-row text-xs items-center gap-4">
      <Avatar className="w-6 h-6">
        <AvatarImage src={user?.pictureUrl} alt={user?.nickname} />
      </Avatar>
      <div
        className={`text-sm ${
          status === "planned"
            ? "text-gray-400"
            : status === "confirmed"
              ? "text-green-600"
              : status === "canceled"
                ? "text-red-500"
                : ""
        }`}
      >
        {user?.nickname}
      </div>
    </div>
  );
}
