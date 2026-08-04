import { createClient } from "@supabase/supabase-js";

import { requireSupabaseConfig } from "./config";

export function createSupabaseServiceRoleClient() {
  const config = requireSupabaseConfig({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  });

  return createClient(config.url, config.publishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
