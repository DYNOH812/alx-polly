import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createPoll(formData: FormData) {
  "use server";
  const question = String(formData.get("question") || "").trim();
  const options = formData
    .getAll("options")
    .map((o) => String(o || "").trim())
    .filter(Boolean);

  if (!question || options.length < 2) {
    redirect("/polls/new?error=missing_fields");
  }

  const [option1, option2] = options;

  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    redirect("/sign-in?redirect=/polls/new");
  }

  const { error } = await supabase.from("polls").insert({
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

export async function deletePoll(formData: FormData) {
  "use server";
  const pollIdRaw = formData.get("pollId");
  const pollId = pollIdRaw ? String(pollIdRaw) : "";
  if (!pollId) return;
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;
  await supabase.from("polls").delete().eq("id", pollId).eq("user_id", auth.user.id);
  revalidatePath("/polls");
}

export async function updatePoll(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const question = String(formData.get("question") || "").trim();
  const option1 = String(formData.get("option1") || "").trim();
  const option2 = String(formData.get("option2") || "").trim();
  if (!id || !question || !option1 || !option2) {
    redirect(`/polls/${id}?error=missing_fields`);
  }
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect(`/sign-in?redirect=/polls/${id}`);
  await supabase
    .from("polls")
    .update({ question, option1, option2 })
    .eq("id", id)
    .eq("user_id", auth.user.id);
  redirect("/polls");
}

export async function submitVote(formData: FormData) {
  "use server";
  const pollId = String(formData.get("pollId"));
  const option = Number(formData.get("option"));
  if (!pollId || ![1, 2].includes(option)) {
    redirect(`/polls/${pollId}`);
  }
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect(`/sign-in?redirect=/polls/${pollId}`);

  await supabase
    .from("votes")
    .upsert([{ poll_id: pollId, user_id: auth.user.id, option }], {
      onConflict: "poll_id,user_id",
    });

  revalidatePath(`/polls/${pollId}`);
  redirect(`/polls/${pollId}?voted=1`);
}


