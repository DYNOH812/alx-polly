import Link from "next/link";
import { Button } from "./ui/button";

export default function SiteHeader() {
  return (
    <header className="border-b border-black/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold">
          Polly
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/polls">Browse Polls</Link>
          </Button>
          <Button asChild>
            <Link href="/polls/new">Create Poll</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/auth/sign-in">Sign In</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}



