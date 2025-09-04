import SiteHeader from "@/components/site-header";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { deletePoll } from "@/lib/poll-actions";

export default async function PollsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await createSupabaseServerClient();

  // Get current user first
  const { data: auth } = await supabase.auth.getUser();
  const currentUserId = auth?.user?.id ?? null;

  // If not signed in, prompt to sign in
  if (!currentUserId) {
    return (
      <div>
        <SiteHeader />
        <main className="px-4 py-8">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">My polls</h1>
            <Button asChild>
              <Link href="/sign-in">Create new poll</Link>
            </Button>
          </div>
          <p className="text-black/70">Please <Link href="/sign-in" className="underline">sign in</Link> to view your polls.</p>
        </main>
      </div>
    );
  }

  // Fetch only the current user's polls
  const { data: polls, error } = await supabase
    .from("polls")
    .select("id, question, user_id")
    .eq("user_id", currentUserId)
    .order("created_at", { ascending: false });

  return (
    <div>
      <SiteHeader />
      <main className="px-4 py-8">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">My polls</h1>
          <Button asChild>
            <Link href="/polls/new">Create new poll</Link>
          </Button>
        </div>
        {error ? (
          <p className="text-red-600">Failed to load polls.</p>
        ) : (
          <ul className="grid grid-cols-3 gap-6">
            {(polls || []).map((poll) => (
              <li key={poll.id} className="h-full rounded-md border border-black/10 p-4">
                <div className="flex h-full flex-col justify-between">
                  <div className="mb-3">
                    <Link href={`/polls/${poll.id}`} className="font-medium hover:underline">
                      {poll.question}
                    </Link>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Link href={`/polls/${poll.id}`} className="text-sm underline">Edit</Link>
                    <form action={deletePoll}>
                      <input type="hidden" name="pollId" value={poll.id} />
                      <Button type="submit" variant="destructive" size="sm">Delete</Button>
                    </form>
                  </div>
                </div>
              </li>
            ))}
            {(!polls || polls.length === 0) && (
              <li className="text-black/70">You have no polls yet. Create one to get started.</li>
            )}
          </ul>
        )}
      </main>
    </div>
  );
}



