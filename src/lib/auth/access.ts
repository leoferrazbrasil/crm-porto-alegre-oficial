export interface AuthProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
  status: string | null;
}

export function canAccessCrm(profile: AuthProfile | null): boolean {
  return profile?.role === "admin" && profile.status === "active";
}

export function getProfileDisplayName(
  profile: AuthProfile,
  fallbackEmail: string
): string {
  return profile.full_name?.trim() || profile.email?.trim() || fallbackEmail;
}
