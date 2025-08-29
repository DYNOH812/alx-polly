"use client";
import Link from "next/link";
import { Button } from "./ui/button";
import { useAuth } from "@/components/auth-provider";

export default function SiteHeader() {
  let auth: ReturnType<typeof useAuth> | null = null;
  try {
    auth = useAuth();
  } catch {}
  const isAuthed = !!auth?.user;
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
          {isAuthed ? (
            <>
              <span className="text-sm text-black/70 hidden sm:inline">
                {auth?.user?.email}
              </span>
              <Button variant="outline" onClick={() => auth?.signOut()}>Sign out</Button>
            </>
          ) : (
            <Button asChild variant="outline">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}



