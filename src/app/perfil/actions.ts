"use server";

import type { AuthFormState } from "@/lib/auth/form-state";
import { changePassword } from "@/lib/auth/password-flows";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface ProfilePasswordClient {
  auth: {
    updateUser(payload: {
      password: string;
    }): Promise<{ error: { message: string } | null }>;
  };
}

export async function updateProfilePassword(
  client: ProfilePasswordClient,
  password: string
): Promise<AuthFormState> {
  return changePassword(client, password);
}

export async function updateProfilePasswordAction(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const password = String(formData.get("password") ?? "");
  const supabase = await createSupabaseServerClient();

  return updateProfilePassword(supabase, password);
}
