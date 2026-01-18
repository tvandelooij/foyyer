# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Foyyer is a Dutch theater discovery and planning application. Users can browse productions, add them to their agenda, write reviews, form groups, and connect with friends.

## Commands

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run lint         # ESLint
npm run format       # Format code with Prettier (src/ and convex/)
npm run format:check # Check formatting

npx convex dev       # Run Convex backend in development (syncs schema/functions)
npx convex deploy    # Deploy Convex to production
```

## Architecture

### Tech Stack
- **Frontend**: Next.js 15 (App Router) with React 19
- **Backend**: Convex (serverless database + functions)
- **Auth**: Clerk (integrated with Convex via JWT)
- **Styling**: Tailwind CSS v4 with shadcn/ui components (new-york style)
- **Forms**: react-hook-form + zod validation

### Directory Structure
- `src/app/` - Next.js App Router pages
- `src/components/` - React components
- `src/components/ui/` - shadcn/ui primitives
- `src/lib/` - Utilities and hooks
- `convex/` - Convex backend (schema, queries, mutations)
- `theater-encyclopedie/` - Python scripts for importing production data from external sources

### Key Patterns

**Convex Integration**
- `ConvexClientProvider` wraps the app with Clerk auth
- `convex-helpers/react/cache/provider` for query caching
- Use `useQuery(api.module.function)` and `useMutation(api.module.function)` from convex/react

**Path Aliases**
- `@/*` maps to `./src/*`

**Data Model** (see `convex/schema.ts`)
- `users` - User profiles synced from Clerk
- `productions` - Theater productions (imported from external source)
- `venues` - Theater venues
- `productionReviews` - User reviews with ratings
- `userAgenda` / `groupAgenda` - Scheduled production visits
- `groups` / `groupMembers` / `groupInvitations` - Social groups
- `friendships` / `notifications` / `feed` - Social features

### Data Import

The `theater-encyclopedie/` directory contains Python scripts to parse and import production data from the Dutch Theater Encyclopedia API into Convex. Uses `uv` for Python package management.

## Development

* Ensure changes are always backwards compatible with existing data in Convex.
* Align frontend changes with existing design patterns (shadcn/ui, Tailwind).