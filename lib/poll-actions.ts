import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * createPoll
 * ----------
 * Creates a new poll with a question and at least two options.
 * - Validates input fields (must have a question and at least 2 options).
 * - Requires authenticated user (redirects to sign-in if not logged in).
 * - Inserts the poll into the "polls" table.
 * - Redirects user based on success/failure.
 *
 * Why:
 * Ensures poll creation is secure, linked to a user, and always valid.
 */
export async function createPoll(formData: FormData) {
  "use server";

  const question = String(formData.get("question") || "").trim();
  const options = formData
    .getAll("options")
    .map((o) => String(o || "").trim())
    .filter(Boolean);

  // Validate required fields
  if (!question || options.length < 2) {
    redirect("/polls/new?error=missing_fields");
  }

  // Only first two options are stored currently
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

/**
 * deletePoll
 * ----------
 * Deletes a poll owned by the authenticated user.
 * - Ensures pollId exists.
 * - Restricts deletion to the poll’s owner.
 * - Revalidates `/polls` page after deletion to refresh the UI.
 *
 * Why:
 * Prevents users from deleting polls they don’t own.
 */
export async function deletePoll(formData: FormData) {
  "use server";

  const pollIdRaw = formData.get("pollId");
  const pollId = pollIdRaw ? String(pollIdRaw) : "";
  if (!pollId) return;

  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;

  await supabase
    .from("polls")
    .delete()
    .eq("id", pollId)
    .eq("user_id", auth.user.id);

  revalidatePath("/polls");
}

/**
 * updatePoll
 * ----------
 * Updates an existing poll’s question and options.
 * - Requires valid poll ID and non-empty fields.
 * - Authenticated users only (must own the poll).
 * - Redirects on success or failure.
 *
 * Why:
 * Allows poll owners to edit their questions/options without breaking data integrity.
 */
export async function updatePoll(formData: FormData) {
  "use server";

  const id = String(formData.get("id"));
  const question = String(formData.get("question") || "").trim();
  const option1 = String(formData.get("option1") || "").trim();
  const option2 = String(formData.get("option2") || "").trim();

  // Validate required fields
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

/**
 * submitVote
 * ----------
 * Records or updates a user’s vote on a poll.
 * - Ensures valid pollId and option (must be 1 or 2).
 * - Authenticated users only (redirects otherwise).
 * - Uses `upsert` to insert or update the vote, enforcing one vote per user.
 * - Revalidates poll page to update results in real-time.
 *
 * Why:
 * Maintains fairness (1 vote per user) and ensures live updates.
 */
export async function submitVote(formData: FormData) {
  "use server";

  const pollId = String(formData.get("pollId"));
  const option = Number(formData.get("option"));

  // Validate pollId and option
  if (!pollId || ![1, 2].includes(option)) {
    redirect(`/polls/${pollId}`);
  }

  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect(`/sign-in?redirect=/polls/${pollId}`);

  await supabase
    .from("votes")
    .upsert([{ poll_id: pollId, user_id: auth.user.id, option }], {
      onConflict: "poll_id,user_id", // Enforce one vote per poll per user
    });

  revalidatePath(`/polls/${pollId}`);
  redirect(`/polls/${pollId}?voted=1`);
}
