"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthContextValue = {
	user: User | null;
	session: Session | null;
	signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
	const supabase = useMemo(() => createSupabaseBrowserClient(), []);
	const [session, setSession] = useState<Session | null>(null);
	const user = session?.user ?? null;

	useEffect(() => {
		let mounted = true;
		// Initialize session
		supabase.auth.getSession().then(({ data }) => {
			if (mounted) setSession(data.session ?? null);
		});
		// Subscribe to changes
		const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
			if (mounted) setSession(newSession);
		});
		return () => {
			mounted = false;
			subscription?.subscription.unsubscribe();
		};
	}, [supabase]);

	async function signOut() {
		await supabase.auth.signOut();
	}

	const value = useMemo<AuthContextValue>(() => ({ user, session, signOut }), [user, session]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}



