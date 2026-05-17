import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/env/server";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client with the SERVICE ROLE KEY.
 *
 * SECURITY WARNING:
 * This client BYPASSES Row Level Security (RLS).
 * It must NEVER be used in client components or exposed to the browser.
 * It should only be used for secure, server-side admin operations.
 */
export function createAdminClient(): SupabaseClient {
  const env = serverEnv();

  return createSupabaseClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
