"use server";

import { redirect } from "next/navigation";

import type { AuthFormState } from "@/lib/auth/form-state";
import { changePassword } from "@/lib/auth/password-flows";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function updatePasswordAction(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const password = String(formData.get("password") ?? "");
  const supabase = await createSupabaseServerClient();
  const result = await changePassword(supabase, password);

  if (result.status === "success") {
    redirect("/login");
  }

  return result;
}
