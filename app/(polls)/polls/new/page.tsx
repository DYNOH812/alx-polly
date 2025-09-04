import SiteHeader from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import CreatePollForm from "@/components/CreatePollForm";
import { createPoll } from "@/lib/poll-actions";

export default async function NewPollPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/sign-in?redirect=/polls/new");
  }
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-2 text-2xl font-semibold">Create a new poll</h1>
        <p className="mb-6 text-black/70">Enter a question and at least two options.</p>
        <CreatePollForm action={createPoll} />
      </main>
    </div>
  );
}


