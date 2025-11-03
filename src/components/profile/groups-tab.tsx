"use client";

import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "../../../convex/_generated/api";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Users } from "lucide-react";

export function GroupsTab({ userId }: { userId: string }) {
  const groups = useQuery(api.group_members.getGroupsForUserId, { userId });

  if (!groups || groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-gray-400 text-sm">Nog geen groepen</p>
        <p className="text-gray-400 text-xs mt-2">
          Sluit je aan bij groepen om voorstellingen te ontdekken en bezoeken te
          coördineren met andere theaterliefhebbers.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) =>
        group ? (
          <Link key={group._id} href={`/groups/${group._id}`}>
            <Card className="border-b-4 border-r-4 rounded-sm bg-stone-100 hover:bg-stone-200 transition-colors border-red-950">
              <CardHeader>
                <div className="flex flex-row items-center gap-2">
                  <Users className="h-5 w-5 text-red-950" />
                  <CardTitle className="text-base font-semibold">
                    {group.name}
                  </CardTitle>
                </div>
                {group.description && (
                  <CardDescription className="text-xs mt-2">
                    {group.description}
                  </CardDescription>
                )}
              </CardHeader>
            </Card>
          </Link>
        ) : null,
      )}
    </div>
  );
}
