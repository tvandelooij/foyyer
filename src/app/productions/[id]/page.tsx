"use client";

import { Authenticated, useMutation } from "convex/react";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "../../../../convex/_generated/dataModel";

import { format } from "date-fns";
import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  CalendarIcon,
  CalendarPlus,
  Check,
  ChevronsUpDown,
  Dot,
  Heart,
  PenLine,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { CommandGroup, CommandInput } from "cmdk";
import { useUser } from "@clerk/nextjs";

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
          <PenLine className="text-red-950 h-6 w-6" />
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
  const user = useUser();
  const groups = useQuery(api.group_members.getGroupsForUserId, {
    userId: user.user?.id,
  });
  const venues = useQuery(api.venues.getVenues);

  const addToUserAgenda = useMutation(api.user_agenda.createAgendaItem);
  const addToGroupAgenda = useMutation(api.group_agenda.addGroupAgendaItem);

  // State to control venue popover
  const [venuePopoverOpen, setVenuePopoverOpen] = React.useState(false);

  const formSchema = z.object({
    type: z.enum(["personal", "group"]),
    groupId: z.optional(z.string()),
    date: z.string().min(0),
    start_time: z.string(),
    venue: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "personal",
      groupId: "",
      date: "",
      start_time: "20:00",
      venue: "",
    },
  });

  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);

    if (data.type === "personal") {
      await addToUserAgenda({
        productionId: production._id,
        venueId: data.venue as Id<"venues">,
        date: data.date,
        start_time: data.start_time,
        status: "confirmed",
      });
    } else if (data.type === "group") {
      await addToGroupAgenda({
        groupId: data.groupId as Id<"groups">,
        productionId: production._id,
        venueId: data.venue as Id<"venues">,
        date: data.date,
        start_time: data.start_time,
      });
    }

    setOpen(false);
    setIsLoading(false);
    return;
  }

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!open) {
      setIsLoading(false);
      form.reset();
    }
  }, [open, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <CalendarPlus className="text-red-950 h-6 w-6" />
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <DialogHeader className="text-left">
              <DialogTitle>Voorstelling inplannen</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2 text-xs">
                    <FormLabel>Voor wie plan je de voorstelling in?</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="rounded-none">
                          <SelectValue placeholder="Selecteer een optie" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="personal" className="rounded-none">
                            Voor mijzelf
                          </SelectItem>
                          <SelectItem value="group" className="rounded-none">
                            Voor een groep
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("type") === "group" && (
                <FormField
                  control={form.control}
                  name="groupId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2">
                      <FormLabel>Selecteer een groep</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="rounded-none">
                            <SelectValue placeholder="Selecteer een groep" />
                          </SelectTrigger>
                          <SelectContent>
                            {groups?.map((group) => (
                              <SelectItem
                                key={group._id}
                                value={group._id}
                                className="rounded-none"
                              >
                                {group.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              <div className="flex flex-col gap-2 w-full">
                <div className="flex flex-row sm:flex-row gap-2 w-full">
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col w-full sm:w-1/2">
                        <FormLabel>Datum</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Kies een datum</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={
                                field.value ? new Date(field.value) : undefined
                              }
                              onSelect={(date) => {
                                if (date) {
                                  field.onChange(date.toISOString());
                                }
                              }}
                              captionLayout="dropdown"
                            />
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="start_time"
                    render={({ field }) => (
                      <FormItem className="flex flex-col w-full sm:w-1/2">
                        <FormLabel>Tijd</FormLabel>
                        <FormControl>
                          <Input
                            type="time"
                            step="1"
                            value={field.value}
                            onChange={field.onChange}
                            className="bg-background text-sm rounded-none w-full appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="venue"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Locatie</FormLabel>
                    <Popover
                      open={venuePopoverOpen}
                      onOpenChange={setVenuePopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value
                              ? venues?.find(
                                  (venue) => venue._id === field.value,
                                )?.name
                              : "Selecteer een locatie"}
                            <ChevronsUpDown className="opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent>
                        <Command>
                          <CommandInput
                            placeholder="Zoek een locatie..."
                            className="h-9"
                          />
                          <CommandList className="flex flex-row overflow-x-auto gap-2 pb-2 max-h-32">
                            <CommandEmpty>Locatie niet gevonden</CommandEmpty>
                            <CommandGroup className="flex flex-row gap-2">
                              {venues?.map((venue) => (
                                <CommandItem
                                  value={venue.name}
                                  key={venue._id}
                                  onSelect={() => {
                                    form.setValue("venue", venue._id);
                                    setVenuePopoverOpen(false);
                                  }}
                                  className="w-full whitespace-nowrap"
                                >
                                  {venue.name}
                                  <Check
                                    className={cn(
                                      "ml-auto",
                                      venue._id === field.value
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center bg-stone-50 border-2 border-red-950 text-red-950 font-bold"
            >
              Opslaan
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
