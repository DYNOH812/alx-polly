"use client";
import SiteHeader from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createSupabaseBrowserClient();

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      const redirectTo = searchParams.get("redirect") || "/";
      router.push(redirectTo);
    } catch (err: any) {
      setError(err?.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    setError(null);
    try {
      const origin = window.location.origin;
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });
      if (oauthError) throw oauthError;
      // Browser will redirect
    } catch (err: any) {
      setError(err?.message || "Google sign-in failed");
      setLoading(false);
    }
  }

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 py-12">
        <h1 className="mb-2 text-2xl font-semibold">Sign in</h1>
        {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
        <form className="space-y-4" onSubmit={handleEmailSignIn}>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
              placeholder="Your password"
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Continue with Email"}
          </Button>
        </form>
        <div className="mt-4">
          <Button type="button" variant="outline" onClick={handleGoogle} disabled={loading}>
            Continue with Google
          </Button>
        </div>
        <p className="mt-6 text-sm text-black/70">
          Don't have an account? <a className="underline" href="/sign-up">Sign up here</a>
        </p>
      </main>
    </div>
  );
}



