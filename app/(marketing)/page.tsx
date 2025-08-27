import SiteHeader from "@/components/site-header";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="mb-3 text-3xl font-semibold">Welcome to Polly</h1>
        <p className="mb-6 text-black/70">
          Create polls, share with friends, and see results in real-time.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/polls/new">Create a poll</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/polls">Browse polls</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}



