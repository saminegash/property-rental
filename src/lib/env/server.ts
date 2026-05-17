import "server-only";

import { z } from "zod";
import { clientEnvSchema } from "./client";

/**
 * Schema for server-only environment variables.
 *
 * These variables are NEVER prefixed with NEXT_PUBLIC_ and MUST NOT
 * appear in any client-side bundle. The `import "server-only"` at the
 * top of this file enforces this — any client component that tries to
 * import this module will get a build error.
 *
 * The full server schema merges client variables (which are also
 * available on the server) with server-only secrets.
 */
const serverOnlySchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, { message: "SUPABASE_SERVICE_ROLE_KEY must not be empty" }),
});

const serverEnvSchema = clientEnvSchema.merge(serverOnlySchema);

export type ServerEnv = z.infer<typeof serverEnvSchema>;

/**
 * Validated server environment variables.
 *
 * Call this function to parse and cache the full server env (client +
 * server-only variables). Throws a descriptive ZodError if any variable
 * is missing or malformed.
 *
 * This function MUST only be called from server-side code:
 * - Server Components
 * - Server Actions
 * - API Routes
 * - next.config.ts
 * - middleware.ts
 *
 * The `import "server-only"` guard at the top of this file will cause
 * a build error if this module is accidentally imported by a client
 * component.
 */
let _serverEnv: ServerEnv | null = null;

export function serverEnv(): ServerEnv {
  if (_serverEnv) return _serverEnv;

  const parsed = serverEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });

  if (!parsed.success) {
    console.error(
      "❌ Invalid server environment variables:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error(
      "Missing or invalid server environment variables. See console output above."
    );
  }

  _serverEnv = parsed.data;
  return _serverEnv;
}
