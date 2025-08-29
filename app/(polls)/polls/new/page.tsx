import SiteHeader from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import CreatePollForm from "@/components/CreatePollForm";

async function createPoll(formData: FormData) {
  "use server";
  const question = String(formData.get("question") || "").trim();
  const options = formData.getAll("options").map((o) => String(o || "").trim()).filter(Boolean);

  if (!question || options.length < 2) {
    redirect("/polls/new?error=missing_fields");
  }

  const [option1, option2] = options;

  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    redirect("/sign-in?redirect=/polls/new");
  }

  const { error } = await supabase
    .from("polls")
    .insert({
      question,
      option1,
      option2,
      user_id: auth.user.id,
    });

  if (error) {
    redirect("/polls/new?error=create_failed");
  }

  redirect("/polls?created=1");
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
        <CreatePollForm action={createPoll} />
      </main>
    </div>
  );
}


