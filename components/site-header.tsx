"use client";
import Link from "next/link";
import { Button } from "./ui/button";
import { useAuth } from "@/components/auth-provider";
import { getUserRole } from "@/lib/roles";

export default function SiteHeader() {
  let auth: ReturnType<typeof useAuth> | null = null;
  try {
    auth = useAuth();
  } catch {}
  const isAuthed = !!auth?.user;
  const role = isAuthed ? getUserRole(auth?.user || null) : null;
  const initial = isAuthed
    ? ((auth?.user?.user_metadata?.full_name as string | undefined)?.charAt(0) || auth?.user?.email?.charAt(0) || "U").toUpperCase()
    : null;
  return (
    <header className="border-b border-black/10 w-full">
      <div className="grid w-full grid-cols-3 items-center px-2 sm:px-4 py-3">
        {/* Left: Brand */}
        <div className="justify-self-start">
          <Link href="/" className="font-semibold">
            Alx Polly
          </Link>
        </div>
        {/* Center: Main nav */}
        <div className="flex items-center justify-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/polls">My Polls</Link>
          </Button>
          <Button asChild>
            <Link href="/polls/new">Create Poll</Link>
          </Button>
        </div>
        {/* Right: Auth controls */}
        <div className="ml-auto flex items-center justify-self-end gap-2">
          {isAuthed ? (
            <>
              {role ? (
                <span className="hidden rounded-full bg-black/10 px-2 py-1 text-xs font-medium text-black/70 sm:inline-block">
                  {role}
                </span>
              ) : null}
              <Button variant="outline" onClick={() => auth?.signOut()}>Sign out</Button>
              <div className="hidden h-8 w-8 items-center justify-center rounded-full bg-black text-xs font-semibold text-white sm:flex">
                {initial}
              </div>
            </>
          ) : (
            <Button asChild variant="outline">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}



