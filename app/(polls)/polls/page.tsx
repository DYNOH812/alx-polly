import SiteHeader from "@/components/site-header";
import Link from "next/link";

export default function PollsPage() {
  const demoPolls = [
    { id: "1", question: "Best JS framework in 2025?" },
    { id: "2", question: "Tabs vs Spaces?" },
  ];

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-semibold">Browse polls</h1>
        <ul className="space-y-3">
          {demoPolls.map((poll) => (
            <li key={poll.id} className="rounded-md border border-black/10 p-4">
              <Link href={`/polls/${poll.id}`} className="font-medium hover:underline">
                {poll.question}
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}



