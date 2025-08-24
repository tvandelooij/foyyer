"use client";

import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "../../../convex/_generated/api";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Id } from "../../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";

export default function Page() {
  const agendaItems = useQuery(api.user_agenda.listAgendaItemsForUser);

  return (
    <div className="flex flex-col mx-6 my-4 pb-20 gap-4">
      <div className="flex flex-col gap-4">
        <div className="text-xl font-bold pl-1 text-red-950">Agenda</div>
        <div className="flex flex-col gap-1">
          {agendaItems?.map((item) => (
            <AgendaItem key={item._id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

type AgendaItemType = {
  _id: Id<"userAgenda">;
  productionId: Id<"productions">;
  venueId: Id<"venues">;
  date: string;
  start_time: string;
  status: "planned" | "confirmed" | "canceled";
  // add other fields as needed
};

function AgendaItem({ item }: { item: AgendaItemType }) {
  const router = useRouter();
  const production = useQuery(api.productions.getProductionById, {
    id: item.productionId,
  });
  const venue = useQuery(api.venues.getVenueById, { venueId: item.venueId });

  const handleAgendaItemClick = (id: Id<"userAgenda">) => {
    router.push(`/agenda/${id}`);
  };

  return (
    <Card
      className="bg-stone-50 rounded-sm"
      onClick={() => handleAgendaItemClick(item._id)}
    >
      <CardHeader className="px-4 flex flex-row justify-between">
        <div>
          <CardTitle className="text-sm">{production?.title}</CardTitle>
          <CardDescription className="text-xs">
            {venue?.name}, {item.start_time.slice(0, 5)}
          </CardDescription>
        </div>
        <div className="text-nowrap text-xs font-semibold text-white bg-orange-500 rounded-sm border-2 border-b-4 border-red-950 p-2">
          {new Date(item.date).toLocaleDateString("nl-NL", {
            day: "2-digit",
            month: "short",
          })}
        </div>
      </CardHeader>
    </Card>
  );
}
