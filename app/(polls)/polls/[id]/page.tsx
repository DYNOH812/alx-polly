import SiteHeader from "@/components/site-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { updatePoll, submitVote } from "@/lib/poll-actions";

interface PollPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}


export default async function PollDetailPage({ params, searchParams }: PollPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: auth } = await supabase.auth.getUser();

  const [pollRes, voteRes] = await Promise.all([
    supabase
      .from("polls")
      .select("id, question, option1, option2, user_id")
      .eq("id", id)
      .single(),
    auth?.user
      ? supabase
          .from("votes")
          .select("option")
          .eq("poll_id", id)
          .eq("user_id", auth.user.id)
          .single()
      : Promise.resolve({ data: null, error: null } as any),
  ]);

  const poll = pollRes.data;
  const userVoteOption: number | null = voteRes?.data?.option ?? null;
  const isOwner = !!auth?.user && poll?.user_id === auth.user.id;

  if (!poll) {
    notFound();
  }

  const sp = (await (searchParams || Promise.resolve({}))) || {};
  const votedParam = sp?.voted;
  const voted = Array.isArray(votedParam) ? votedParam.includes("1") : votedParam === "1";

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-semibold">Poll</h1>
        {isOwner ? (
          <form className="space-y-4" action={updatePoll}>
            <input type="hidden" name="id" value={poll.id} />
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="question">Question</label>
              <input
                id="question"
                name="question"
                defaultValue={poll.question}
                className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Options</label>
              <div className="grid gap-2">
                <input
                  name="option1"
                  defaultValue={poll.option1}
                  className="rounded-md border border-black/10 bg-white px-3 py-2"
                  required
                />
                <input
                  name="option2"
                  defaultValue={poll.option2}
                  className="rounded-md border border-black/10 bg-white px-3 py-2"
                  required
                />
              </div>
            </div>
            <Button type="submit">Update changes</Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md border border-black/10 p-4">
              <p className="mb-3 text-base font-medium text-black/90">{poll.question}</p>
              {voted ? (
                <p className="text-sm text-green-700">Thank you for voting.</p>
              ) : (
                <form action={submitVote} className="space-y-3">
                  <input type="hidden" name="pollId" value={poll.id} />
                  <fieldset className="space-y-2">
                    <legend className="mb-1 text-sm font-semibold text-black/70">Cast your vote</legend>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="option" value={1} defaultChecked={userVoteOption === 1} />
                      <span>{poll.option1}</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="option" value={2} defaultChecked={userVoteOption === 2} />
                      <span>{poll.option2}</span>
                    </label>
                  </fieldset>
                  <div>
                    {auth?.user ? (
                      <Button type="submit">Vote</Button>
                    ) : (
                      <Button asChild>
                        <a href={`/sign-in?redirect=/polls/${poll.id}`}>Sign in to vote</a>
                      </Button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}



