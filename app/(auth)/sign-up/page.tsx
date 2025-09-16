"use client";
import SiteHeader from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

/**
 * SignUpPage Component
 *
 * Handles user registration with:
 * 1. Email + Password (with confirmation + validation).
 * 2. Google OAuth (via Supabase).
 *
 * Why:
 * - Provides secure account creation.
 * - Validates passwords before sending requests.
 * - Confirms email via Supabase verification link.
 */
export default function SignUpPage() {
  const router = useRouter();

  // Local state for form inputs and request status
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false); // Tracks if signup succeeded

  // Supabase client instance (browser-side)
  const supabase = createSupabaseBrowserClient();

  /**
   * Handles sign-up with email + password.
   * - Validates password match and length.
   * - Uses Supabase Auth `signUp`.
   * - Sends verification email with redirect callback.
   */
  async function handleEmailSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Ensure passwords match before sending request
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Ensure password meets length requirements
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      // Attempt sign-up with Supabase
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Redirect link sent in Supabase confirmation email
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) throw signUpError;

      // If successful, switch to success screen
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Handles Google OAuth signup/login.
   * - Opens Supabase OAuth with Google provider.
   * - Redirects user to `/auth/callback` after successful login.
   */
  async function handleGoogle() {
    setLoading(true);
    setError(null);

    try {
      const origin = window.location.origin;

      // Trigger Google OAuth flow
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback`, // OAuth callback route
        },
      });

      if (oauthError) throw oauthError;

      // No manual redirect required — handled by Supabase/browser
    } catch (err: any) {
      setError(err?.message || "Google sign-up failed");
      setLoading(false); // Reset loading only if error occurs
    }
  }

  // Success screen: displayed when signup succeeds
  if (success) {
    return (
      <div>
        <SiteHeader />
        <main className="mx-auto max-w-md px-4 py-12">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-semibold text-green-600">
              Check your email!
            </h1>
            <p className="mb-6 text-black/70">
              We've sent you a confirmation link. Please check your email and
              click the link to verify your account.
            </p>
            <Button asChild>
              <a href="/sign-in">Go to Sign In</a>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Default render: sign-up form
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 py-12">
        <h1 className="mb-2 text-2xl font-semibold">Create your account</h1>

        {/* Error message */}
        {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

        {/* Email + Password form */}
        <form className="space-y-4" onSubmit={handleEmailSignUp}>
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
              placeholder="Create a password"
              required
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border border-black/10 bg-white px-3 py-2"
              placeholder="Confirm your password"
              required
            />
          </div>

          {/* Submit button changes text while loading */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        {/* Google OAuth button */}
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full"
          >
            Continue with Google
          </Button>
        </div>

        {/* Link to sign-in page */}
        <p className="mt-6 text-sm text-black/70">
          Already have an account?{" "}
          <a className="underline" href="/sign-in">
            Sign in
          </a>
        </p>
      </main>
    </div>
  );
}
