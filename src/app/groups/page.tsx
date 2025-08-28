"use client";

import { Authenticated } from "convex/react";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "../../../convex/_generated/api";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dot, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Id } from "../../../convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";

export default function Page() {
  return (
    <Authenticated>
      <div className="mx-6 my-4">
        <div className="flex flex-col gap-6">
          <div className="flex flex-row justify-between">
            <div className="text-3xl font-bold">Groepen</div>
            <NewGroup />
          </div>
          <div>
            <GroupList />
          </div>
        </div>
      </div>
    </Authenticated>
  );
}

import React, { useCallback } from "react";

const NewGroup = React.memo(function NewGroup() {
  const router = useRouter();

  const handleAddGroup = useCallback(() => {
    router.push("/groups/new");
  }, [router]);

  return (
    <Button
      className="bg-orange-500 px-1 p-r-2 border-2 border-red-950 border-b-4 rounded-sm"
      onClick={handleAddGroup}
    >
      <Plus />
      <div className="text-xs font-bold pr-1">Nieuwe groep</div>
    </Button>
  );
});

const GroupList = React.memo(function GroupList() {
  const user = useUser();
  const groups = useQuery(api.group_members.getGroupsForUserId, {
    userId: user.user?.id,
  });
  const groupsOwner = useQuery(api.groups.listGroupsCreatedByUser);

  if (!groups || !groupsOwner) {
    return null;
  }

  const allGroupsMap = new Map<string, Group>();
  groups.forEach((g) => {
    if (g && g._id) {
      allGroupsMap.set(g._id, g);
    }
  });
  groupsOwner.forEach((g) => allGroupsMap.set(g._id, g));
  const allGroups = Array.from(allGroupsMap.values());

  return (
    <div className="flex flex-col gap-4 pb-20">
      {allGroups?.length === 0 && (
        <div className="flex items-center justify-center text-center text-stone-500 text-sm h-32">
          Je bent nog geen lid van een groep.
        </div>
      )}
      {allGroups?.map((group) => (
        <MemoGroupCard key={group._id} group={group} />
      ))}
    </div>
  );
});

type Group = {
  _id: Id<"groups">;
  name: string;
  // Add other fields if needed
};

const MemoGroupCard = React.memo(function GroupCard({
  group,
}: {
  group: Group;
}) {
  const memberCount = useQuery(api.group_members.getMemberCountForGroupId, {
    groupId: group._id,
  });
  const visitCount = useQuery(api.group_agenda.getGroupVisitCount, {
    groupId: group._id,
  });

  const router = useRouter();

  const handleGroupClick = useCallback(
    (groupId: Id<"groups">) => {
      router.push(`/groups/${groupId}`);
    },
    [router],
  );

  return (
    <Card
      onClick={() => handleGroupClick(group._id)}
      className="rounded-sm border-b-4 border-r-4 p-4 bg-stone-100"
    >
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">{group.name}</CardTitle>
        </div>
        <CardDescription className="flex flex-row items-center text-xs">
          <div className="">
            {memberCount} {memberCount === 1 ? "lid" : "leden"}
          </div>
          <Dot />
          <div>
            {visitCount} voorstelling{visitCount === 1 ? "" : "en"} bezocht
          </div>
        </CardDescription>
      </CardHeader>
    </Card>
  );
});
