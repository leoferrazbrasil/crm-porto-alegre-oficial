import { NextResponse, type NextRequest } from "next/server";

import { exchangeAuthCallback } from "@/lib/auth/callback";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const supabase = await createSupabaseServerClient();
  const result = await exchangeAuthCallback(supabase, {
    code: requestUrl.searchParams.get("code"),
    tokenHash: requestUrl.searchParams.get("token_hash"),
    type: requestUrl.searchParams.get("type"),
    next: requestUrl.searchParams.get("next")
  });

  const redirectUrl = new URL(result.nextPath, request.url);

  if (result.status === "error") {
    redirectUrl.searchParams.set("auth_error", "callback");
  }

  return NextResponse.redirect(redirectUrl);
}
