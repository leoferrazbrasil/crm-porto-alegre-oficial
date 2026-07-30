import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface SupabasePublicEnvironment {
  url?: string;
  publishableKey?: string;
  anonKey?: string;
}

export interface SupabasePublicConfig {
  url: string;
  publishableKey: string;
}

let browserClient: SupabaseClient | null = null;

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

export function getSupabaseBrowserClient(): SupabaseClient | null {
  const config = resolveSupabaseConfig({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  });

  if (!config) {
    return null;
  }

  browserClient ??= createClient(config.url, config.publishableKey);
  return browserClient;
}
