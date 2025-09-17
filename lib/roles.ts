import type { User } from "@supabase/supabase-js";

export type UserRole = "admin" | "user";

/**
 * Derives the application role for a Supabase user.
 * - Prefers app_metadata.role set by Supabase Auth or hooks
 * - Falls back to user_metadata.role if present
 * - Defaults to "user"
 */
export function getUserRole(user: User | null | undefined): UserRole {
  if (!user) return "user";
  const appRole = (user.app_metadata as any)?.role as string | undefined;
  if (appRole === "admin") return "admin";
  const metaRole = (user.user_metadata as any)?.role as string | undefined;
  if (metaRole === "admin") return "admin";
  return "user";
}


