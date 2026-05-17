/**
 * Environment validation barrel export.
 *
 * Usage:
 *
 *   // In client or server code — only client-safe vars:
 *   import { clientEnv } from "@/lib/env/client";
 *   const url = clientEnv().NEXT_PUBLIC_SUPABASE_URL;
 *
 *   // In server-only code — all vars including secrets:
 *   import { serverEnv } from "@/lib/env/server";
 *   const serviceKey = serverEnv().SUPABASE_SERVICE_ROLE_KEY;
 *
 * DO NOT re-export server.ts from this barrel file.
 * Re-exporting server.ts here would make `import { clientEnv } from "@/lib/env"`
 * also pull in the "server-only" module, breaking any client component
 * that only needs client env vars.
 *
 * Always import from the specific submodule:
 *   - "@/lib/env/client" for client-safe variables
 *   - "@/lib/env/server" for server-only variables
 */

export { clientEnv, type ClientEnv } from "./client";

// NOTE: serverEnv is intentionally NOT exported here.
// Import it directly from "@/lib/env/server" in server-only code.
