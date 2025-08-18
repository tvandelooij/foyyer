"use client";

import { Authenticated, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CirclePlus, Dot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Id } from "../../../convex/_generated/dataModel";

export default function Page() {
  const router = useRouter();

  const handleAddGroup = () => {
    router.push("/groups/new");
  };

  return (
    <Authenticated>
      <div className="mx-6 my-4">
        <div className="flex flex-col gap-6">
          <div className="flex flex-row items-center justify-between">
            <div className="text-2xl font-bold">Groepen</div>
            <Button className="bg-green-500" onClick={() => handleAddGroup()}>
              <div className="flex flex-row items-center gap-1">
                <CirclePlus />
                <div className="text-xs font-semibold">Toevoegen</div>
              </div>
            </Button>
          </div>
          <div>
            <GroupList />
          </div>
        </div>
      </div>
    </Authenticated>
  );
}

function GroupList() {
  const groups = useQuery(api.group_members.getGroupsForUserId);

  return (
    <div>
      {groups?.map((group) => (
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

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">{group.name}</CardTitle>
        </div>
        <CardDescription className="flex flex-row items-center text-xs">
          <div className="">{memberCount} leden</div>
          <Dot />
          <div>14 voorstellingen bezocht</div>
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
