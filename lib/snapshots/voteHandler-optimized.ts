import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Optimized for readability and performance without changing behavior
export async function submitVote(formData: FormData) {
  "use server";

  // Fast path validation (avoid client/auth if invalid)
  const pollId = String(formData.get("pollId") || "").trim();
  const optionValue = Number(formData.get("option"));
  const isOptionValid = optionValue === 1 || optionValue === 2;
  if (!pollId || !isOptionValid) {
    redirect(`/polls/${pollId}`);
  }

  // Single client creation + single auth fetch
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const userId = data?.user?.id || "";
  if (!userId) {
    redirect(`/sign-in?redirect=/polls/${pollId}`);
  }

  // Direct upsert with minimal intermediate objects
  await supabase
    .from("votes")
    .upsert([{ poll_id: pollId, user_id: userId, option: optionValue }], {
      onConflict: "poll_id,user_id",
    });

  // Revalidate affected path and redirect once
  revalidatePath(`/polls/${pollId}`);
  redirect(`/polls/${pollId}?voted=1`);
}


