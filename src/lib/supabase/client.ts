"use client";

import { createBrowserClient } from "@supabase/ssr";
import { clientEnv } from "@/lib/env/client";

import type { SupabaseClient } from "@supabase/supabase-js";

export type TypedSupabaseClient = SupabaseClient;

/**
 * Creates a Supabase client for use in browser / client components.
 *
 * This client:
 * - Uses only the public anon key (NEXT_PUBLIC_SUPABASE_ANON_KEY).
 * - Adheres strictly to Row Level Security (RLS).
 * - Manages auth cookies automatically via `@supabase/ssr`.
 * - Is a singleton — multiple calls return the same instance.
 *
 * Usage:
 *   "use client";
 *   import { createClient } from "@/lib/supabase/client";
 *
 *   export default function MyComponent() {
 *     const supabase = createClient();
 *     // supabase.auth.getSession(), supabase.from("listings"), etc.
 *   }
 *
 * Security:
 * - The service-role key is NEVER used here.
 * - All queries go through RLS — the client can only access
 *   rows that the authenticated user's JWT permits.
 * - `clientEnv()` validates that the required env vars exist
 *   before creating the client.
 */
export function createClient(): TypedSupabaseClient {
  const env = clientEnv();

  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      isSingleton: true,
    }
  );
}
