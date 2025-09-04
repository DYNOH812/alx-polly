import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Original submitVote action (before optimization/refactor)
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
    .upsert(
      [{ poll_id: pollId, user_id: auth.user.id, option }],
      { onConflict: "poll_id,user_id" }
    );

  revalidatePath(`/polls/${pollId}`);
  redirect(`/polls/${pollId}?voted=1`);
}


