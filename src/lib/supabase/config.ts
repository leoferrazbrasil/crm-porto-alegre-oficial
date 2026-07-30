export interface SupabasePublicEnvironment {
  url?: string;
  publishableKey?: string;
  anonKey?: string;
}

export interface SupabasePublicConfig {
  url: string;
  publishableKey: string;
}

export function resolveSupabaseConfig(
  environment: SupabasePublicEnvironment
): SupabasePublicConfig | null {
  const url = environment.url?.trim().replace(/\/+$/, "");
  const publishableKey =
    environment.publishableKey?.trim() || environment.anonKey?.trim();

  if (!url || !publishableKey) {
    return null;
  }

  return { url, publishableKey };
}

export function requireSupabaseConfig(
  environment: SupabasePublicEnvironment
): SupabasePublicConfig {
  const config = resolveSupabaseConfig(environment);

  if (!config) {
    throw new Error("Supabase public environment is not configured");
  }

  return config;
}
