import SiteHeader from "@/components/site-header";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-md px-4 py-12">
        <h1 className="mb-2 text-2xl font-semibold">Sign in</h1>
        <p className="mb-6 text-black/70">Authentication coming soon.</p>
        <div className="flex gap-2">
          <Button disabled>Continue with Email</Button>
          <Button variant="outline" disabled>
            Continue with Google
          </Button>
        </div>
      </main>
    </div>
  );
}



