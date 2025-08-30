import { Id } from "../../convex/_generated/dataModel";

export type FeedProps = {
  userId: string | undefined;
};

export type FeedItem = {
  _id: string;
  userId: string;
  type: "review";
  data: {
    productionId: string;
    reviewId: string;
  };
};

export type FeedTextProps = {
  user: { userId: string; nickname: string };
  review: { visited: boolean; rating?: number };
  production: { _id: string; title: string };
};

export type AgendaItemType = {
  _id: Id<"userAgenda">;
  productionId: Id<"productions">;
  venueId: Id<"venues">;
  date: string;
  start_time: string;
  status: "planned" | "confirmed" | "canceled";
};

export type Group = {
  _id: Id<"groups">;
  name: string;
};

export type ProductionVisit = {
  productionId: string;
  date: string;
};

export type InviteFriendProps = {
  friendId: string;
  inviteSent: boolean;
  groupId: string;
};

export type Review = {
  _id: Id<"productionReviews">;
  _creationTime: number;
  productionId: Id<"productions">;
  userId: Id<"users">;
  visited: boolean;
  rating: number | null;
  review: string | null;
  updatedAt: number;
};

export type Production = {
  _creationTime: number;
  _id: Id<"productions">;
  priref_id: string;
  title: string;
  start_date: string;
  discipline: string;
  producer: string;
  venue: string;
  tags: string[];
};
