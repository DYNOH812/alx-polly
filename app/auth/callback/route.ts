import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get("code");
	const redirectTo = requestUrl.searchParams.get("redirect") || "/polls";

	if (code) {
		const supabase = await createSupabaseServerClient();
		await supabase.auth.exchangeCodeForSession(code);
	}

	return NextResponse.redirect(new URL(redirectTo, request.url));
}




