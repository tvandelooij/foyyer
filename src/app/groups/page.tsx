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
import { Dot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Id } from "../../../convex/_generated/dataModel";

export default function Page() {
  return (
    <Authenticated>
      <div className="mx-6 my-4">
        <div className="flex flex-col gap-12">
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

function NewGroup() {
  const router = useRouter();

  const handleAddGroup = () => {
    router.push("/groups/new");
  };

  return (
    <Button className="bg-green-500 px-3" onClick={() => handleAddGroup()}>
      <div className="text-xs font-bold">Nieuwe groep</div>
    </Button>
  );
}

function GroupList() {
  const groups = useQuery(api.group_members.getGroupsForUserId);
  const groupsOwner = useQuery(api.groups.listGroupsCreatedByUser);

  if (!groups || !groupsOwner) {
    return null;
  }

  const allGroupsMap = new Map<string, Group>();
  groups.forEach((g) => allGroupsMap.set(g._id, g));
  groupsOwner.forEach((g) => allGroupsMap.set(g._id, g));
  const allGroups = Array.from(allGroupsMap.values());

  return (
    <div className="flex flex-col gap-4 pb-20">
      {allGroups?.length === 0 && (
        <div className="flex items-center justify-center text-center text-gray-500 text-sm h-32">
          Je bent nog niet lid van een groep.
        </div>
      )}
      {allGroups?.map((group) => (
        <GroupCard key={group._id} group={group} />
      ))}
    </div>
  );
}

type Group = {
  _id: Id<"groups">;
  name: string;
  // Add other fields if needed
};

function GroupCard({ group }: { group: Group }) {
  const memberCount = useQuery(api.group_members.getMemberCountForGroupId, {
    groupId: group._id,
  });

  const router = useRouter();

  const handleGroupClick = (groupId: Id<"groups">) => {
    router.push(`/groups/${groupId}`);
  };

  return (
    <Card onClick={() => handleGroupClick(group._id)}>
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">{group.name}</CardTitle>
        </div>
        <CardDescription className="flex flex-row items-center text-xs">
          <div className="">
            {memberCount} {memberCount === 1 ? "lid" : "leden"}
          </div>
          <Dot />
          <div>14 voorstellingen bezocht</div>
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
