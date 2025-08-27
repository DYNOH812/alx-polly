import SiteHeader from "@/components/site-header";

interface PollPageProps {
  params: { id: string };
}

export default function PollDetailPage({ params }: PollPageProps) {
  const { id } = params;
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-2 text-2xl font-semibold">Poll #{id}</h1>
        <p className="text-black/70">Detailed view coming soon.</p>
      </main>
    </div>
  );
}



