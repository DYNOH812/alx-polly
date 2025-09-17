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
// Types
export type UserId = string;

export interface PollCreateInput {
  question: string;
  option1: string;
  option2: string;
}

export interface PollUpdateInput extends PollCreateInput {
  id: string;
}

export interface VoteInput {
  pollId: string;
  option: 1 | 2;
}

export interface CommentInput {
  pollId: string;
  content: string;
}

type EmailJobType = "vote" | "comment";

// Error helpers
function fail(path: string, code: string) {
  redirect(`${path}?error=${code}`);
}

function go(path: string) {
  redirect(path);
}

// Supabase and auth helpers
async function getSupabase() {
  return createSupabaseServerClient();
}

async function requireUserOrRedirect(redirectTo: string): Promise<{ userId: UserId }> {
  const supabase = await getSupabase();
  const { data } = await supabase.auth.getUser();
  if (!data || !data.user) {
    go(`/sign-in?redirect=${encodeURIComponent(redirectTo)}`);
  }
  return { userId: data!.user!.id };
}

// Validation helpers
function parseCreateInput(formData: FormData): PollCreateInput | null {

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
    question: input.question,
    option1: input.option1,
    option2: input.option2,
    user_id: userId,
  });
  if (error) return false;
  return true;
}

async function dbDeletePoll(userId: UserId, pollId: string) {
  const supabase = await getSupabase();
  await supabase.from("polls").delete().eq("id", pollId).eq("user_id", userId);
}

async function dbUpdatePoll(userId: UserId, input: PollUpdateInput) {
  const supabase = await getSupabase();
  await supabase
    .from("polls")
    .update({ question: input.question, option1: input.option1, option2: input.option2 })
    .eq("id", input.id)
    .eq("user_id", userId);
}

async function dbUpsertVote(userId: UserId, input: VoteInput) {
  const supabase = await getSupabase();
  await supabase
    .from("votes")
    .upsert([{ poll_id: input.pollId, user_id: userId, option: input.option }], {
      onConflict: "poll_id,user_id",
    });
}

async function dbInsertComment(userId: UserId, input: CommentInput) {
  const supabase = await getSupabase();
  await supabase.from("comments").insert({ poll_id: input.pollId, user_id: userId, content: input.content });
}

async function dbEnqueueEmailJob(type: EmailJobType, pollId: string, actorUserId: string, payload: Record<string, unknown> = {}) {
  const supabase = await getSupabase();
  const table = (supabase as any).from?.("email_jobs");
  // In tests, mocks might not provide insert; guard to avoid throwing.
  if (table && typeof table.insert === "function") {
    await table.insert({ type, poll_id: pollId, actor_user_id: actorUserId, payload });
  }
}

// Actions
export async function createPoll(formData: FormData) {
  "use server";
  const input = parseCreateInput(formData);
  if (!input) fail("/polls/new", "missing_fields");

  const { userId } = await requireUserOrRedirect("/polls/new");
  const ok = await dbInsertPoll(userId, input!);
  if (!ok) fail("/polls/new", "create_failed");
  go("/polls?created=1");
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
  if (!pollId) return; // silently ignore
  const { userId } = await requireUserOrRedirect("/polls");
  await dbDeletePoll(userId, pollId);
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
