import SiteHeader from "@/components/site-header";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function PollsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: polls, error } = await supabase
    .from("polls")
    .select("id, question")
    .order("created_at", { ascending: false });

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-semibold">Browse polls</h1>
        {error ? (
          <p className="text-red-600">Failed to load polls.</p>
        ) : (
          <ul className="space-y-3">
            {(polls || []).map((poll) => (
              <li key={poll.id} className="rounded-md border border-black/10 p-4">
                <Link href={`/polls/${poll.id}`} className="font-medium hover:underline">
                  {poll.question}
                </Link>
              </li>
            ))}
            {(!polls || polls.length === 0) && (
              <li className="text-black/70">No polls yet. Create one to get started.</li>
            )}
          </ul>
        )}
      </main>
    </div>
  );
}



