# Using Context7 to build Supabase Realtime live results

This doc shows how Context7 can inject live, version-specific documentation into your prompt while building the realtime live results feature.

## Example prompt for Gemini CLI

Use the MCP server we configured in the README. Then ask for targeted, current guidance:

```
Use context7 to fetch the latest Supabase Realtime Channels examples for @supabase/supabase-js v2 and @supabase/ssr in a Next.js App Router project. I need a client component that subscribes to Postgres Changes for the `votes` table filtered by `poll_id`, and a server component that provides initial counts using head: true selects. Ensure compatibility with Next.js 15 server actions and @supabase/ssr cookie handling.
```

Context7 will inject up-to-date references and code excerpts about:
- Creating a channel with `supabase.channel(name).on('postgres_changes', ...)`
- Using `filter` with `poll_id=eq.<id>` for server-side filtering
- Calling `removeChannel(channel)` on unmount
- Using `select(..., { count: 'exact', head: true })` for fast counts

## Resulting implementation (in this repo)

- Server component `app/(polls)/polls/[id]/page.tsx` fetches initial counts:

```ts
const [opt1CountRes, opt2CountRes] = await Promise.all([
  supabase
    .from("votes")
    .select("id", { count: "exact", head: true })
    .eq("poll_id", id)
    .eq("option", 1),
  supabase
    .from("votes")
    .select("id", { count: "exact", head: true })
    .eq("poll_id", id)
    .eq("option", 2),
]);
```

- Client component `components/LiveResults.tsx` subscribes to changes and refetches counts:

```ts
const channel = supabase
  .channel(`public:votes:poll_${pollId}`)
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "votes", filter: `poll_id=eq.${pollId}` },
    () => refetchCounts()
  )
  .subscribe();
```

This pattern mirrors Context7-injected guidance from current Supabase docs and avoids stale examples.

## Tips
- Keep the client component minimal and resilient by refetching counts on any mutation event.
- Use server components for data fetching; use client only for interactivity (subscriptions/UI updates).
- Do not expose secrets; use `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` only.


