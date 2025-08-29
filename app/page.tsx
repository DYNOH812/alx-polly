"use client";
import SiteHeader from "@/components/site-header";

export default function HomePage() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="mb-3 text-3xl font-semibold">Welcome to Polly</h1>
        <p className="mb-6 text-black/70">
          Create polls, share with friends, and see results in real-time.
        </p>
      </main>
    </div>
  );
}
