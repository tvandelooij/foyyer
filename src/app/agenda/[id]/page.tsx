"use client";

import { useParams } from "next/navigation";
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

export default function Page() {
  const params = useParams();
  const id = params.id as Id<"userAgenda">;

  const updateAgendaItemStatus = useMutation(
    api.user_agenda.updateAgendaItemStatus,
  );

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

  return (
    <div className="flex flex-col mx-6 my-4 pb-20 gap-4">
      <div className="flex flex-col gap-4">
        <div className="text-3xl font-bold">{production?.title}</div>
        <div>
          <Card className="border-none">
            <CardHeader>
              <CardDescription>
                <div className="flex flex-col gap-2">
                  <div className="text-base text-black font-semibold">
                    {agendaItem?.date
                      ? new Date(agendaItem.date).toLocaleDateString("nl-NL", {
                          day: "2-digit",
                          month: "short",
                        })
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
