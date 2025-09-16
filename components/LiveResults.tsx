"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type LiveResultsProps = {
  pollId: string;
  option1Label: string;
  option2Label: string;
  initialOption1Count: number;
  initialOption2Count: number;
};

export default function LiveResults({
  pollId,
  option1Label,
  option2Label,
  initialOption1Count,
  initialOption2Count,
}: LiveResultsProps) {
  const [option1Count, setOption1Count] = useState<number>(initialOption1Count);
  const [option2Count, setOption2Count] = useState<number>(initialOption2Count);

  const total = useMemo(() => option1Count + option2Count, [option1Count, option2Count]);
  const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 100));

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    // Helper to refetch counts for robustness across INSERT/UPDATE/DELETE
    const refetchCounts = async () => {
      const [o1, o2] = await Promise.all([
        supabase
          .from("votes")
          .select("id", { count: "exact", head: true })
          .eq("poll_id", pollId)
          .eq("option", 1),
        supabase
          .from("votes")
          .select("id", { count: "exact", head: true })
          .eq("poll_id", pollId)
          .eq("option", 2),
      ]);
      setOption1Count(o1.count ?? 0);
      setOption2Count(o2.count ?? 0);
    };

    // Initial sanity sync in case the page was cached
    refetchCounts();

    const channel = supabase
      .channel(`public:votes:poll_${pollId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "votes", filter: `poll_id=eq.${pollId}` },
        () => {
          // Any mutation can affect totals; keep it simple and robust
          refetchCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pollId]);

  return (
    <div className="rounded-md border border-black/10 p-4">
      <h2 className="mb-3 text-sm font-semibold text-black/70">Live results</h2>
      <div className="space-y-3">
        <ProgressRow label={option1Label} count={option1Count} percent={pct(option1Count)} colorClass="bg-blue-600" />
        <ProgressRow label={option2Label} count={option2Count} percent={pct(option2Count)} colorClass="bg-purple-600" />
      </div>
      <p className="mt-3 text-xs text-black/60">Total votes: {total}</p>
    </div>
  );
}

function ProgressRow({
  label,
  count,
  percent,
  colorClass,
}: {
  label: string;
  count: number;
  percent: number;
  colorClass: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="truncate pr-2 text-black/80">{label}</span>
        <span className="tabular-nums text-black/60">{percent}% ({count})</span>
      </div>
      <div className="h-2 w-full rounded bg-black/10">
        <div className={`h-2 rounded ${colorClass}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}


