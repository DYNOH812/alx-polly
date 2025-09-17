"use client";

import { useCallback, useMemo, useState } from "react";

type PollShareProps = {
  pollId: string;
};

/**
 * Renders a shareable link and QR code for a poll.
 * - No runtime deps; uses a public QR render API.
 * - Provides copy-to-clipboard UX with fallback.
 */
export default function PollShare({ pollId }: PollShareProps) {
  const [copied, setCopied] = useState<boolean>(false);

  const url = useMemo(() => {
    if (typeof window === "undefined") return "";
    const origin = window.location.origin;
    return `${origin}/polls/${pollId}`;
  }, [pollId]);

  const qrSrc = useMemo(() => {
    const encoded = encodeURIComponent(url || "");
    // goqr.me API (PNG). Alternative: api.qrserver.com
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encoded}`;
  }, [url]);

  const onCopy = useCallback(async () => {
    try {
      if (navigator.clipboard && url) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
        return;
      }
      // Fallback
      const temp = document.createElement("textarea");
      temp.value = url;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      document.body.removeChild(temp);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  }, [url]);

  if (!url) return null;

  return (
    <div className="rounded-md border border-black/10 p-4">
      <h3 className="mb-3 text-sm font-semibold text-black/70">Share this poll</h3>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        <img src={qrSrc} alt="Poll QR Code" width={200} height={200} className="rounded bg-white" />
        <div className="w-full min-w-0">
          <p className="truncate text-sm text-black/70" title={url}>{url}</p>
          <div className="mt-2">
            <button
              type="button"
              onClick={onCopy}
              className="rounded-md bg-black text-white px-3 py-1.5 text-sm hover:bg-black/90"
            >
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


