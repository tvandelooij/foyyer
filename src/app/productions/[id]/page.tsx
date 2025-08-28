"use client";

import { Authenticated, useMutation } from "convex/react";
import { useQuery } from "convex-helpers/react/cache/hooks";
import { api } from "../../../../convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { Id } from "../../../../convex/_generated/dataModel";

import { format } from "date-fns";
import React, { useCallback } from "react";
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
import Rating from "@/components/rating";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Stars from "@/components/stars";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as Id<"productions">;

  const production = useQuery(api.productions.getProductionById, { id });
  const hasLiked = useQuery(api.production_likes.hasLikedProduction, {
    productionId: id,
  });
  const maybeReview = useQuery(
    api.production_reviews.getReviewsForProductionByUser,
    { productionId: id },
  );
  const reviews = useQuery(api.production_reviews.getReviewsForProduction, {
    productionId: id,
  });

  const likeProduction = useMutation(api.production_likes.likeProduction);
  const unlikeProduction = useMutation(api.production_likes.unlikeProduction);

  const handleLikeClick = useCallback(
    async (productionId: Id<"productions">) => {
      if (hasLiked) {
        await unlikeProduction({ productionId });
      } else {
        await likeProduction({ productionId });
      }
    },
    [hasLiked, likeProduction, unlikeProduction],
  );

  const handleWriteReviewClick = useCallback(() => {
    router.push(`/review/new/${production?._id}`);
  }, [router, production?._id]);

  return (
    <Authenticated>
      <div className="flex flex-col mx-6 my-4 pb-20 gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex flex-row justify-between items-center gap-2">
            <div className="text-3xl font-bold">{production?.title}</div>
            <div>
              <Heart
                className={`text-orange-500 cursor-pointer ${hasLiked ? "fill-orange-500" : "fill-none"}`}
                onClick={
                  production?._id
                    ? () => handleLikeClick(production._id)
                    : undefined
                }
              />
            </div>
          </div>
          <div>
            {production?.tags && production.tags.length > 0 && (
              <div className="flex flex-row flex-wrap gap-2">
                {production.discipline !== "amusementsvorm" && (
                  <Badge className="p-1 pb-2 px-2 bg-red-300 rounded-sm font-semibold text-white text-xs">
                    {production.discipline}
                  </Badge>
                )}
                {production.tags.map((tag) => (
                  <Badge
                    key={tag}
                    className="p-1 pb-2 px-2 bg-stone-300 rounded-sm font-semibold text-white text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 border-b-1 pb-4">
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
              {production?.season && Array.isArray(production.season)
                ? production.season.map(
                    (season: string, idx: number, arr: string[]) => (
                      <span key={season} className="text-xs text-gray-500">
                        {season}
                        {idx !== arr.length - 1 && ", "}
                      </span>
                    ),
                  )
                : production?.season}
            </div>
          </div>
          {production && (
            <div className="flex flex-col py-2 items-center gap-2 border-t-1">
              <div className="text-sm text-gray-500">Jouw beoordeling</div>
              <Rating
                production={{
                  _id: production!._id,
                  avg_rating: production?.avg_rating ?? 0,
                  rating_count: production?.rating_count ?? 0,
                  review_count: production?.review_count ?? 0,
                }}
                maybeReview={
                  maybeReview
                    ? { _id: maybeReview._id, rating: maybeReview.rating ?? 0 }
                    : undefined
                }
              />
            </div>
          )}
        </div>
        <div className="flex flex-row gap-2 items-center justify-center border-b-1 pb-4">
          {/* Only mount AddToAgendaDialog when production exists and dialog is open */}
          {production && <AddToAgendaDialog production={production} />}
          <Button
            className="bg-stone-50 shadow-none border-2 border-red-950"
            onClick={handleWriteReviewClick}
          >
            <PenLine className="text-red-950 h-6 w-6" />
            <div className="text-xs text-red-950">Schrijf een review</div>
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          <div>
            {production?.review_count && production.review_count > 0 ? (
              <div>
                <p className="text-xs text-gray-500">
                  {production.review_count} review
                  {production.review_count !== 1 ? "s" : ""}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-gray-500">Nog geen reviews</p>
              </div>
            )}
          </div>
          <div className="flex flex-row items-center gap-2">
            <MemoStars n={production?.avg_rating} size={4} />
            {production?.avg_rating ? (
              <p className="text-xs text-gray-500">
                {production.avg_rating.toFixed(1)} ({production.rating_count}{" "}
                beoordeling{production.rating_count !== 1 ? "en" : ""})
              </p>
            ) : (
              <p className="text-xs text-gray-500">(0)</p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {reviews
            ?.filter((review) => (review.rating ?? 0) > 0)
            .map((review) => (
              <MemoReviewCard
                key={review._id}
                review={{
                  ...review,
                  rating: review.rating ?? null,
                  review: review.review ?? null,
                  userId: review.userId as Id<"users">,
                }}
              />
            ))}
        </div>
      </div>
    </Authenticated>
  );
}

type Review = {
  _id: Id<"productionReviews">;
  _creationTime: number;
  productionId: Id<"productions">;
  userId: Id<"users">;
  visited: boolean;
  rating: number | null;
  review: string | null;
  updatedAt: number;
};

const MemoReviewCard = React.memo(function ReviewCard({
  review,
}: {
  review: Review;
}) {
  const router = useRouter();
  const user = useQuery(api.users.getUserById, { id: review.userId });
  const handleProfileClick = useCallback(() => {
    if (user?.userId) router.push(`/profile/${user.userId}`);
  }, [router, user?.userId]);
  return (
    <Card className="border-none">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="w-6 h-6" onClick={handleProfileClick}>
          <AvatarImage src={user?.pictureUrl} alt={user?.nickname} />
        </Avatar>
        <div className="flex flex-row gap-2 items-center">
          <CardTitle className="text-xs">
            <span onClick={handleProfileClick}>{user?.nickname}</span>{" "}
            <span className="font-normal">geeft</span>
          </CardTitle>
          <MemoStars n={review.rating ?? undefined} size={2} />
        </div>
      </CardHeader>
      {review.review && (
        <CardContent>
          <p className="text-xs text-gray-500">{review.review}</p>
        </CardContent>
      )}
    </Card>
  );
});

const MemoStars = React.memo(Stars);

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
  const router = useRouter();
  const groups = useQuery(api.group_members.getGroupsForUserId, {
    userId: user.user?.id,
  });
  const venues = useQuery(api.venues.getVenues);
  const maybeItem = useQuery(api.user_agenda.getAgendaItemForProduction, {
    id: production._id as Id<"productions">,
  });

  const addToUserAgenda = useMutation(api.user_agenda.createAgendaItem);
  const addToGroupAgenda = useMutation(api.group_agenda.addGroupAgendaItem);
  const updateUserAgenda = useMutation(api.user_agenda.updateAgendaItem);

  // State to control venue popover
  const [venuePopoverOpen, setVenuePopoverOpen] = React.useState(false);

  const formSchema = z.object({
    type: z.enum(["personal", "group"]),
    groupId: z.optional(z.string()),
    date: z.string().min(0),
    start_time: z.string(),
    venue: z.string(),
  });

  const defaultValues = React.useMemo(() => {
    const values: {
      type: "personal" | "group";
      start_time: string;
      date: string | undefined;
      venue: string | undefined;
      groupId?: string | undefined;
    } = {
      type: "personal",
      start_time: "20:00",
      date: undefined,
      venue: undefined,
    };

    if (maybeItem) {
      values.type = maybeItem.groupId ? "group" : "personal";
      if (maybeItem.groupId) {
        values.groupId = maybeItem.groupId;
      }
      values.date = maybeItem.date;
      values.start_time = maybeItem.start_time;
      values.venue = maybeItem.venueId as Id<"venues">;
    }
    return values;
  }, [maybeItem]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);

    if (data.type === "personal") {
      if (maybeItem) {
        await updateUserAgenda({
          _id: maybeItem._id as Id<"userAgenda">,
          userId: user.user?.id,
          productionId: production._id,
          date: data.date,
          start_time: data.start_time,
          venueId: data.venue as Id<"venues">,
          status: "confirmed",
        });
      } else {
        await addToUserAgenda({
          productionId: production._id,
          venueId: data.venue as Id<"venues">,
          date: data.date,
          start_time: data.start_time,
          status: "confirmed",
        });
      }
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
    form.reset();
    router.push("/agenda");
  }

  // Reset form when dialog closes or when defaultValues change
  React.useEffect(() => {
    if (!open) {
      setIsLoading(false);
      form.reset(defaultValues);
    }
  }, [open, form, defaultValues]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div>
          <Button className="bg-stone-50 shadow-none border-2 border-red-950">
            <CalendarPlus className="text-red-950 h-6 w-6" />
            <div className="text-xs text-red-950">Voeg toe aan agenda</div>
          </Button>
        </div>
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
                                key={group?._id}
                                value={group?._id ?? ""}
                                className="rounded-none"
                              >
                                {group?.name}
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
                            className="bg-background text-base rounded-none w-full appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
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
                          <CommandList className="flex flex-col gap-2 pb-2 max-h-32 overflow-y-scroll overscroll-contain touch-auto">
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
