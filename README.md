## Overview

Alx Polly is a Next.js App Router + Supabase polling app. Users can register, create polls, vote, and share polls via link or QR. Realtime updates show live results and presence.

## Features

- Live results via Supabase Realtime
- Presence indicator (current viewers per poll)
- QR code sharing (no dependency)
- Donut results chart (SVG-only)
- Authentication with Supabase

## Getting Started

Run the development server:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Environment variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Optional for MCP/ops:

```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Architecture

- Server Components fetch and render data using Supabase server client.
- Client Components handle interactivity (Realtime subscriptions, presence, charts, QR).

Key files:

- `app/(polls)/polls/[id]/page.tsx`: Poll detail, initial counts
- `components/LiveResults.tsx`: Realtime vote updates
- `components/LivePresence.tsx`: Presence indicator
- `components/ResultsChart.tsx`: SVG donut chart
- `components/PollShare.tsx`: QR/link sharing
- `lib/roles.ts`: Derive user role from Supabase metadata
 - Email jobs: queued via `email_jobs` table (see below)

## Realtime Results & Presence

Initial counts use `select(..., { count: 'exact', head: true })`. Client subscribes to Postgres changes and refetches counts on mutation.

```ts
supabase
  .channel(`public:votes:poll_${pollId}`)
  .on("postgres_changes", { event: "*", schema: "public", table: "votes", filter: `poll_id=eq.${pollId}` }, refetchCounts)
  .subscribe();
```

Presence join:

```ts
channel.subscribe((status) => {
  if (status === "SUBSCRIBED") {
    channel.track({ user_id, poll_id: pollId });
  }
});
```

## Context7 MCP with Gemini CLI (Live docs during codegen)
## AI Reviews & Release Notes

This repo includes a Release Drafter workflow to auto-draft release notes on pushes/PRs.

To enable CodeRabbit PR reviews:

1. Install CodeRabbit on your GitHub repo/organization
2. Configure CodeRabbit rules in their dashboard (or via repository settings)
3. Open PRs—CodeRabbit will annotate diffs automatically

## Email Notifications (queue stub)

Server Actions enqueue lightweight email jobs after votes and comments. Create this table:

```sql
create table if not exists public.email_jobs (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('vote','comment')),
  poll_id uuid not null references public.polls(id) on delete cascade,
  actor_user_id uuid not null references auth.users(id),
  payload jsonb not null default '{}',
  created_at timestamptz not null default now(),
  processed_at timestamptz
);
```

Processing options:

- Supabase Scheduled Functions or Edge Functions to process pending jobs
- External worker (e.g., Deno/Node) polling `email_jobs where processed_at is null`
- After processing, set `processed_at = now()`


Configure Context7 MCP to inject live documentation into prompts.

Example prompt:

```
Use context7 to fetch the latest Supabase Realtime Channels examples for @supabase/supabase-js v2 and @supabase/ssr in a Next.js App Router project. I need a client component that subscribes to Postgres Changes for the `votes` table filtered by `poll_id`, and a server component that provides initial counts using head: true selects. Ensure compatibility with Next.js 15 server actions and @supabase/ssr cookie handling.
```
