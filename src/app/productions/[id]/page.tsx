"use client";

import { Authenticated, useMutation } from "convex/react";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "../../../../convex/_generated/dataModel";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CalendarPlus, Dot, Heart, PenLine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from "@/components/ui/dialog";

export default function Page() {
  const params = useParams();
  const id = params.id as Id<"productions">;

  const production = useQuery(api.productions.getProductionById, { id });
  const hasLiked = useQuery(api.production_likes.hasLikedProduction, {
    productionId: id,
  });
  const likeProduction = useMutation(api.production_likes.likeProduction);
  const unlikeProduction = useMutation(api.production_likes.unlikeProduction);

  const handleLikeClick = async (productionId: Id<"productions">) => {
    if (hasLiked) {
      await unlikeProduction({ productionId });
    } else {
      await likeProduction({ productionId });
    }
  };

  return (
    <Authenticated>
      <div className="flex flex-col mx-6 my-4 pb-20 gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-row justify-between items-center gap-2">
            <div className="text-3xl font-bold">{production?.title}</div>
            <div>
              <Heart
                className={`text-red-400 cursor-pointer ${hasLiked ? "fill-red-400" : "fill-none"}`}
                onClick={
                  production?._id
                    ? () => handleLikeClick(production._id)
                    : undefined
                }
              />
            </div>
          </div>
          <div>
            <Badge className="p-1 px-2 bg-purple-300 font-semibold text-white">
              {production?.discipline}
            </Badge>
          </div>
        </div>
        <div className="border-b-1 pb-4">
          <div className="flex flex-col gap-1">
            <div className="flex flex-row flex-wrap w-full">
              {(production?.producer.slice(0, 5) ?? []).map(
                (name, idx, arr) => {
                  const parts = name.split(",").map((part) => part.trim());
                  return (
                    <div
                      key={name}
                      className="text-sm text-gray-800 flex items-center"
                    >
                      {parts.length === 2 ? `${parts[1]} ${parts[0]}` : name}
                      {idx !== arr.length - 1 && <Dot />}
                    </div>
                  );
                },
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500">{production?.notes}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-row gap-16 items-center justify-center border-b-1 pb-4">
          {production && <AddToAgendaDialog production={production} />}
          <PenLine className="text-gray-600 h-6 w-6" />
        </div>
      </div>
    </Authenticated>
  );
}

type Production = {
  _id: Id<"productions">;
  priref_id: string;
  title: string;
  start_date: string;
  discipline: string;
  producer: string[];
  venue: string;
  // Add other fields if needed
};

function AddToAgendaDialog({ production }: { production: Production }) {
  const groups = useQuery(api.group_members.getGroupsForUserId);

  const formSchema = z.object({
    type: z.enum(["personal", "group"]),
    groupId: z.optional(z.string()),
    date: z.number().min(0),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "personal",
      groupId: undefined,
      date: 0,
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    // get members of group
    // add production to calender for each group member
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <CalendarPlus className="text-gray-600 h-6 w-6" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className="text-left">
          <DialogTitle>Voeg toe aan een agenda</DialogTitle>
        </DialogHeader>
        <div></div>
      </DialogContent>
    </Dialog>
  );
}
