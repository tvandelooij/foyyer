"use client";

import { useParams } from "next/navigation";
import { Id } from "../../../../convex/_generated/dataModel";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "../../../../convex/_generated/api";
// import { Card, CardDescription, CardHeader } from "@/components/ui/card";

export default function Page() {
  const params = useParams();
  const id = params.id as Id<"userAgenda">;

  const agendaItem = useQuery(api.user_agenda.getAgendaItem, { id });
  const production = useQuery(
    api.productions.getProductionById,
    agendaItem?.productionId
      ? { id: agendaItem.productionId as Id<"productions"> }
      : "skip",
  );

  return (
    <div className="flex flex-col mx-6 my-4 pb-20 gap-4">
      <div className="flex flex-col gap-4">
        <div className="text-3xl font-bold">{production?.title}</div>
        <div>
          {/* <Card>
                        <CardHeader>
                            <CardDescription>{agendaItem?.}</CardDescription>
                        </CardHeader>
                    </Card> */}
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

// function AgendaDetails({ agendaItem }: { agendaItem: any }) {

// }

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

  return (
    <div className="flex flex-col gap-2">
      {memberItems?.map((item) => (
        <div key={item._id}>{item.status}</div>
      ))}
    </div>
  );
}
