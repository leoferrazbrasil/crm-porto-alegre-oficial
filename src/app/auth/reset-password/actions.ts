"use server";

import { headers } from "next/headers";

import type { AuthFormState } from "@/lib/auth/form-state";
import { requestPasswordReset } from "@/lib/auth/password-flows";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function resetPasswordAction(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const headerStore = await headers();
  const origin =
    headerStore.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";
  const supabase = await createSupabaseServerClient();

  return requestPasswordReset(supabase, email, origin);
}
