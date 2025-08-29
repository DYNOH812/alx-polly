"use client";

import { useAuth } from "./auth-provider";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push('/sign-in');
    }
  }, [session, router]);

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
