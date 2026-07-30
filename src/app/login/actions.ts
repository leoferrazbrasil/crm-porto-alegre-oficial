"use server";

import { redirect } from "next/navigation";

import type { AuthFormState } from "@/lib/auth/form-state";
import { authenticateWithPassword } from "@/lib/auth/password-flows";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function loginAction(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createSupabaseServerClient();
  const result = await authenticateWithPassword(supabase, email, password);

  if (result.status === "success") {
    redirect("/");
  }

  return result;
}
