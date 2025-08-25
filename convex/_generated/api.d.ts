/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as friendships from "../friendships.js";
import type * as group_agenda from "../group_agenda.js";
import type * as group_invitations from "../group_invitations.js";
import type * as group_members from "../group_members.js";
import type * as groups from "../groups.js";
import type * as notifications from "../notifications.js";
import type * as production_likes from "../production_likes.js";
import type * as production_reviews from "../production_reviews.js";
import type * as productions from "../productions.js";
import type * as user_agenda from "../user_agenda.js";
import type * as users from "../users.js";
import type * as venues from "../venues.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  friendships: typeof friendships;
  group_agenda: typeof group_agenda;
  group_invitations: typeof group_invitations;
  group_members: typeof group_members;
  groups: typeof groups;
  notifications: typeof notifications;
  production_likes: typeof production_likes;
  production_reviews: typeof production_reviews;
  productions: typeof productions;
  user_agenda: typeof user_agenda;
  users: typeof users;
  venues: typeof venues;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
