import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { clientEnv } from "@/lib/env/client";

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client for use in Server Components (RSC).
 *
 * This client:
 * - Uses the public anon key — all queries go through RLS.
 * - Reads the user's session from request cookies.
 * - Cannot write cookies (Server Components cannot set response headers).
 *   Session refresh is handled by middleware; see middleware.ts.
 * - Must be created fresh per-request — never cache or share across requests.
 *
 * Usage:
 *   import { createClient } from "@/lib/supabase/server";
 *
 *   export default async function Page() {
 *     const supabase = await createClient();
 *     const { data } = await supabase.from("listings").select();
 *     return <div>...</div>;
 *   }
 *
 * Security:
 * - No service-role key. This client is RLS-bound.
 * - Session is read from HTTP-only cookies set by Supabase Auth.
 * - `getUser()` should be used for authorization checks (verifies
 *   the token with the Auth server). `getSession()` reads unverified
 *   cookie data and must NOT be used for authorization.
 */
export async function createClient(): Promise<SupabaseClient> {
  const env = clientEnv();
  const cookieStore = await cookies();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method is called from within a Server Component
            // where cookies cannot be set. This is expected — session
            // refresh is handled by the middleware client instead.
            // Swallowing the error here is safe and recommended by Supabase.
          }
        },
      },
    }
  );
}
