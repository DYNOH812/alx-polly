import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
  if (!question || options.length < 2) return null;
  const [option1, option2] = options as [string, string];
  return { question, option1, option2 };
}

function parseUpdateInput(formData: FormData): PollUpdateInput | null {
  const id = String(formData.get("id") || "").trim();
  const question = String(formData.get("question") || "").trim();
  const option1 = String(formData.get("option1") || "").trim();
  const option2 = String(formData.get("option2") || "").trim();
  if (!id || !question || !option1 || !option2) return null;
  return { id, question, option1, option2 };
}

function parseVoteInput(formData: FormData): VoteInput | null {
  const pollId = String(formData.get("pollId") || "").trim();
  const optionNum = Number(formData.get("option"));
  if (!pollId || ![1, 2].includes(optionNum)) return null;
  return { pollId, option: optionNum as 1 | 2 };
}

function parseCommentInput(formData: FormData): CommentInput | null {
  const pollId = String(formData.get("pollId") || "").trim();
  const content = String(formData.get("content") || "").trim();
  if (!pollId || !content) return null;
  return { pollId, content };
}

// Data operations (DB layer)
async function dbInsertPoll(userId: UserId, input: PollCreateInput) {
  const supabase = await getSupabase();
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

export async function deletePoll(formData: FormData) {
  "use server";
  const pollIdRaw = formData.get("pollId");
  const pollId = pollIdRaw ? String(pollIdRaw) : "";
  if (!pollId) return; // silently ignore
  const { userId } = await requireUserOrRedirect("/polls");
  await dbDeletePoll(userId, pollId);
  revalidatePath("/polls");
}

export async function updatePoll(formData: FormData) {
  "use server";
  const input = parseUpdateInput(formData);
  if (!input) fail(`/polls/${String(formData.get("id") || "")}`, "missing_fields");
  const { userId } = await requireUserOrRedirect(`/polls/${input!.id}`);
  await dbUpdatePoll(userId, input!);
  go("/polls");
}

export async function submitVote(formData: FormData) {
  "use server";
  const input = parseVoteInput(formData);
  if (!input) go(`/polls/${String(formData.get("pollId") || "")}`);
  const { userId } = await requireUserOrRedirect(`/polls/${input!.pollId}`);
  await dbUpsertVote(userId, input!);
  await dbEnqueueEmailJob("vote", input!.pollId, userId, { option: input!.option });
  revalidatePath(`/polls/${input!.pollId}`);
  go(`/polls/${input!.pollId}?voted=1`);
}

export async function createComment(formData: FormData) {
  "use server";
  const input = parseCommentInput(formData);
  if (!input) go(`/polls/${String(formData.get("pollId") || "")}`);
  const { userId } = await requireUserOrRedirect(`/polls/${input!.pollId}`);
  await dbInsertComment(userId, input!);
  await dbEnqueueEmailJob("comment", input!.pollId, userId, { length: input!.content.length });
  revalidatePath(`/polls/${input!.pollId}`);
  go(`/polls/${input!.pollId}#comments`);
}


