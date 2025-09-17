import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createComment } from "@/lib/poll-actions";

export default async function Comments({ pollId }: { pollId: string }) {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();

  const { data: rows } = await supabase
    .from("comments")
    .select("id, content, user_id, created_at")
    .eq("poll_id", pollId)
    .order("created_at", { ascending: true });

  return (
    <section id="comments" className="rounded-md border border-black/10 p-4">
      <h3 className="mb-3 text-sm font-semibold text-black/70">Comments</h3>
      <div className="space-y-3">
        {(rows || []).length === 0 ? (
          <p className="text-sm text-black/60">No comments yet.</p>
        ) : (
          (rows || []).map((c) => (
            <div key={c.id} className="rounded bg-black/5 p-2 text-sm">
              <p className="whitespace-pre-wrap break-words">{c.content}</p>
              <p className="mt-1 text-xs text-black/50">by {c.user_id.slice(0, 6)} • {new Date(c.created_at).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
      <div className="mt-4">
        {auth?.user ? (
          <form action={createComment} className="space-y-2">
            <input type="hidden" name="pollId" value={pollId} />
            <textarea name="content" required rows={3} className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm" placeholder="Write a comment..." />
            <div>
              <button type="submit" className="rounded-md bg-black px-3 py-1.5 text-sm text-white hover:bg-black/90">Post</button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-black/60">Sign in to post a comment.</p>
        )}
      </div>
    </section>
  );
}


