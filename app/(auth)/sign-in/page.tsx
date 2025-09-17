"use client";
import SiteHeader from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * SignInPage Component
 *
 * This page handles user authentication via:
 * 1. Email + Password (Supabase Auth)
 * 2. Google OAuth (Supabase Auth with redirect)
 *
 * Why:
 * - Provides a simple and secure login flow.
 * - Redirects authenticated users to the intended route (or home page).
 */
export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for handling form inputs and request feedback
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Tracks loading state for UX
  const [error, setError] = useState<string | null>(null); // Stores error messages

  // Supabase client instance (browser-side)
  const supabase = createSupabaseBrowserClient();

  /**
   * Handles sign-in with email + password.
   * - Uses Supabase Auth's `signInWithPassword`.
   * - Redirects user to the requested route (from query param) or home page.
   * - Provides error handling and loading states for better UX.
   */
  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault(); // Prevent default form submit behavior
    setLoading(true);
    setError(null);

    try {
      // Attempt to sign in with provided email + password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // Check if user was redirected from a protected page
      const redirectTo = searchParams.get("redirect") || "/";
      router.push(redirectTo); // Navigate user after login
    } catch (err: any) {
      // Capture and display errors from Supabase
      setError(err?.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Handles Google OAuth login flow.
   * - Opens Supabase OAuth with Google provider.
   * - Redirects to `/auth/callback` after successful login.
   * - Errors are captured and displayed to the user.
   */
  async function handleGoogle() {
    setLoading(true);
    setError(null);

    try {
      const origin = window.location.origin;

      // Trigger Google OAuth flow with redirect back to app
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`, // Callback route in app
        },
      });

      if (oauthError) throw oauthError;

      // No manual redirect needed — browser handles OAuth redirection.
    } catch (err: any) {
      setError(err?.message || "Google sign-in failed");
      setLoading(false); // Reset loading if OAuth fails
    }
  }

  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 py-12">
        <h1 className="mb-2 text-2xl font-semibold">Sign in</h1>

        {/* Error message display */}
        {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

        {/* Email + Password login form */}
        <form className="space-y-4" onSubmit={handleEmailSignIn}>
          <div>
            <label
              className="mb-1 block text-sm font-medium"
              htmlFor="email"
            >
              Email
            </label>
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
            <label
              className="mb-1 block text-sm font-medium"
              htmlFor="password"
            >
              Password
            </label>
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

          {/* Submit button changes text while loading */}
          <Button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Continue with Email"}
          </Button>
        </form>

        {/* Google OAuth button */}
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogle}
            disabled={loading}
          >
            Continue with Google
          </Button>
        </div>

        {/* Link to registration page */}
        <p className="mt-6 text-sm text-black/70">
          Don't have an account?{" "}
          <a className="underline" href="/sign-up">
            Sign up here
          </a>
        </p>
      </main>
    </div>
  );
}



