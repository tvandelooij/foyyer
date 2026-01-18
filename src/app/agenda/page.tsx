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
import { Authenticated } from "convex/react";

import React, { useCallback } from "react";
import { AgendaItemType } from "@/lib/types";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MemoAgendaItem = React.memo(AgendaItem);
const MemoPastVisitItem = React.memo(PastVisitItem);

export default function Page() {
  return (
    <Authenticated>
      <div className="flex flex-col mx-6 my-4 pb-20 gap-4">
        <div className="flex flex-col gap-4">
          <div className="text-xl font-bold pl-1 text-red-950 dark:text-gray-200">
            Agenda
          </div>
          <Tabs defaultValue="upcoming">
            <TabsList className="grid w-full grid-cols-2 bg-stone-100 rounded-sm">
              <TabsTrigger
                value="upcoming"
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
                Aankomend
              </TabsTrigger>
              <TabsTrigger
                value="past"
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
                Bezocht
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="mt-4">
              <UpcomingAgendaList />
            </TabsContent>

            <TabsContent value="past" className="mt-4">
              <PastVisitsList />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Authenticated>
  );
}

function UpcomingAgendaList() {
  const agendaItems = useQuery(api.user_agenda.listAgendaItemsForUser);

  if (agendaItems && agendaItems.length === 0) {
    return (
      <div className="flex flex-col gap-2 items-center justify-center px-4 text-center min-h-[50vh]">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Voeg voorstellingen toe aan je agenda om ze hier te zien.
        </p>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 bg-stone-50 text-red-950 font-semibold dark:bg-gray-200 dark:text-gray-900 px-4 py-2 rounded-sm text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Ontdek voorstellingen
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {agendaItems?.map((item) => (
        <MemoAgendaItem key={item._id} item={item} />
      ))}
    </div>
  );
}

function PastVisitsList() {
  const pastItems = useQuery(api.user_agenda.listPastAgendaItemsForUser);

  if (pastItems && pastItems.length === 0) {
    return (
      <div className="flex flex-col gap-2 items-center justify-center px-4 text-center min-h-[50vh]">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Je hebt nog geen voorstellingen bezocht.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {pastItems?.map((item) => (
        <MemoPastVisitItem key={item._id} item={item} />
      ))}
    </div>
  );
}

function AgendaItem({ item }: { item: AgendaItemType }) {
  const router = useRouter();
  const production = useQuery(api.productions.getProductionById, {
    id: item.productionId,
  });
  const venue = useQuery(api.venues.getVenueById, { venueId: item.venueId });

  const handleAgendaItemClick = useCallback(
    (id: Id<"userAgenda">) => {
      router.push(`/agenda/${id}`);
    },
    [router],
  );

  return (
    <Card
      className="bg-stone-50 rounded-sm dark:bg-gray-700 dark:border-gray-700"
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

function PastVisitItem({ item }: { item: AgendaItemType }) {
  const router = useRouter();
  const production = useQuery(api.productions.getProductionById, {
    id: item.productionId,
  });
  const venue = useQuery(api.venues.getVenueById, { venueId: item.venueId });

  const handleClick = useCallback(() => {
    router.push(`/productions/${item.productionId}`);
  }, [router, item.productionId]);

  return (
    <Card
      className="bg-stone-50 rounded-sm dark:bg-gray-700 dark:border-gray-700"
      onClick={handleClick}
    >
      <CardHeader className="px-4 flex flex-row justify-between">
        <div>
          <CardTitle className="text-sm">{production?.title}</CardTitle>
          <CardDescription className="text-xs">
            {production?.producer}
          </CardDescription>
          <CardDescription className="text-xs">{venue?.name}</CardDescription>
        </div>
        <div className="text-nowrap text-xs font-semibold text-white bg-gray-400 rounded-sm border-2 border-b-4 border-gray-600 p-2">
          {new Date(item.date).toLocaleDateString("nl-NL", {
            day: "2-digit",
            month: "short",
            year: "2-digit",
          })}
        </div>
      </CardHeader>
    </Card>
  );
}
