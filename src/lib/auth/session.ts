import type { User } from "@supabase/supabase-js";
import { notFound, redirect } from "next/navigation";

import { canAccessCrm, type AuthProfile } from "./access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

interface ProfileRow {
  user_id: string;
  full_name: string | null;
  role: string | null;
}

export interface CurrentAdminSession {
  user: User;
  profile: AuthProfile;
}

export async function requireCurrentAdmin(): Promise<CurrentAdminSession> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profileRow, error: profileError } = await supabase
    .from("profiles")
    .select("user_id, full_name, role")
    .eq("user_id", user.id)
    .maybeSingle<ProfileRow>();

  if (profileError || !profileRow) {
    notFound();
  }

  const profile: AuthProfile = {
    id: profileRow.user_id,
    email: user.email ?? null,
    full_name: profileRow.full_name,
    role: profileRow.role,
    status: "active"
  };

  if (!canAccessCrm(profile)) {
    notFound();
  }

  return { user, profile };
}
