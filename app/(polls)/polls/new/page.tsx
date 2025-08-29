import SiteHeader from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function createPoll(formData: FormData) {
  "use server";
  const question = String(formData.get("question") || "").trim();
  const option1 = String(formData.get("option1") || "").trim();
  const option2 = String(formData.get("option2") || "").trim();

  if (!question || !option1 || !option2) {
    redirect("/polls/new?error=missing_fields");
  }

  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    redirect("/sign-in?redirect=/polls/new");
  }

  const { data, error } = await supabase
    .from("polls")
    .insert({
      question,
      option1,
      option2,
      user_id: auth.user.id,
    })
    .select("id")
    .single();

  if (error) {
    redirect("/polls/new?error=create_failed");
  }

  // Go to Browse so the user can see the newly created poll in the list
  redirect("/polls");
}

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
        <form className="space-y-4" action={createPoll}>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="question">Question</label>
            <input
              id="question"
              name="question"
              className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
              placeholder="What should we ask?"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Options</label>
            <div className="grid gap-2">
              <input
                name="option1"
                className="rounded-md border border-black/10 bg-white px-3 py-2"
                placeholder="Option 1"
                required
              />
              <input
                name="option2"
                className="rounded-md border border-black/10 bg-white px-3 py-2"
                placeholder="Option 2"
                required
              />
            </div>
          </div>
          <Button type="submit">Create</Button>
        </form>
      </main>
    </div>
  );
}


