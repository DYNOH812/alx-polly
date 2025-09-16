"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type LivePresenceProps = {
  pollId: string;
};

export default function LivePresence({ pollId }: LivePresenceProps) {
  const [presentUserIds, setPresentUserIds] = useState<string[]>([]);

  const uniqueCount = useMemo(() => new Set(presentUserIds).size, [presentUserIds]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const channel = supabase.channel(`presence:votes:poll_${pollId}`, {
      config: {
        presence: {
          key: Math.random().toString(36).slice(2),
        },
      },
    });

    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState<{ user_id: string }>();
      const users: string[] = [];
      Object.values(state).forEach((metas) => {
        metas.forEach((meta) => {
          if (meta.user_id) users.push(meta.user_id);
        });
      });
      setPresentUserIds(users);
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        const { data: auth } = await supabase.auth.getUser();
        const user_id = auth?.user?.id ?? "anon";
        channel.track({ user_id, poll_id: pollId });
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pollId]);

  return (
    <div className="rounded-md border border-black/10 p-3">
      <p className="text-sm text-black/70">Viewing now: <span className="font-medium">{uniqueCount}</span></p>
    </div>
  );
}


