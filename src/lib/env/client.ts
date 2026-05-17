import { z } from "zod";

/**
 * Schema for client-safe environment variables.
 *
 * These variables are prefixed with NEXT_PUBLIC_ and are bundled into
 * the client-side JavaScript. They MUST NOT contain any secrets.
 *
 * Validation is deferred — the schema is exported and parsed on-demand
 * by calling `clientEnv()`, not at module load time. This prevents
 * build failures when server-only code imports shared modules.
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url({ message: "NEXT_PUBLIC_SUPABASE_URL must be a valid URL" }),

  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, { message: "NEXT_PUBLIC_SUPABASE_ANON_KEY must not be empty" }),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

/**
 * Validated client environment variables.
 *
 * Call this function to parse and cache the client env. Throws a
 * descriptive ZodError if any variable is missing or malformed.
 *
 * Safe to call from both server and client code.
 */
let _clientEnv: ClientEnv | null = null;

export function clientEnv(): ClientEnv {
  if (_clientEnv) return _clientEnv;

  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  if (!parsed.success) {
    console.error(
      "❌ Invalid client environment variables:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error(
      "Missing or invalid client environment variables. See console output above."
    );
  }

  _clientEnv = parsed.data;
  return _clientEnv;
}

export { clientEnvSchema };
