import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface SupabasePublicEnvironment {
  url?: string;
  anonKey?: string;
}

export interface SupabasePublicConfig {
  url: string;
  anonKey: string;
}

let browserClient: SupabaseClient | null = null;

export function resolveSupabaseConfig(
  environment: SupabasePublicEnvironment
): SupabasePublicConfig | null {
  const url = environment.url?.trim().replace(/\/+$/, "");
  const anonKey = environment.anonKey?.trim();

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export function getSupabaseBrowserClient(): SupabaseClient | null {
  const config = resolveSupabaseConfig({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  });

  if (!config) {
    return null;
  }

  browserClient ??= createClient(config.url, config.anonKey);
  return browserClient;
}

