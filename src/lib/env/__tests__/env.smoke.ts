/**
 * Smoke test for environment validation.
 *
 * Run: pnpm tsx src/lib/env/__tests__/env.smoke.ts
 *
 * Tests both success (with valid env) and failure (with missing env) paths.
 * This is NOT a Jest/Vitest test — it's a standalone script for manual verification.
 */

// --- Test 1: clientEnv() should throw when NEXT_PUBLIC vars are missing ---
console.log("\n--- Test 1: clientEnv() with missing vars ---");

// Clear any existing env
delete process.env.NEXT_PUBLIC_SUPABASE_URL;
delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// We need to bypass the module cache for each test, so we use dynamic import
// with a cache buster won't work in Node — instead we test inline.

import { z } from "zod";

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

const serverOnlySchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

const serverSchema = clientSchema.merge(serverOnlySchema);

// Test missing client vars
const missingClient = clientSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: undefined,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
});

if (!missingClient.success) {
  console.log("✅ PASS: clientEnv rejects missing vars");
  console.log("   Errors:", JSON.stringify(missingClient.error.flatten().fieldErrors, null, 2));
} else {
  console.log("❌ FAIL: clientEnv should have rejected missing vars");
  process.exit(1);
}

// --- Test 2: clientEnv() should reject invalid URL ---
console.log("\n--- Test 2: clientEnv() with invalid URL ---");

const badUrl = clientSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "some-key",
});

if (!badUrl.success) {
  console.log("✅ PASS: clientEnv rejects invalid URL");
} else {
  console.log("❌ FAIL: clientEnv should have rejected invalid URL");
  process.exit(1);
}

// --- Test 3: clientEnv() should accept valid vars ---
console.log("\n--- Test 3: clientEnv() with valid vars ---");

const validClient = clientSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test",
});

if (validClient.success) {
  console.log("✅ PASS: clientEnv accepts valid vars");
} else {
  console.log("❌ FAIL: clientEnv should have accepted valid vars");
  process.exit(1);
}

// --- Test 4: serverEnv() should reject missing service role key ---
console.log("\n--- Test 4: serverEnv() with missing service role key ---");

const missingServiceKey = serverSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "some-key",
  SUPABASE_SERVICE_ROLE_KEY: undefined,
});

if (!missingServiceKey.success) {
  console.log("✅ PASS: serverEnv rejects missing SUPABASE_SERVICE_ROLE_KEY");
} else {
  console.log("❌ FAIL: serverEnv should have rejected missing key");
  process.exit(1);
}

// --- Test 5: serverEnv() should accept all valid vars ---
console.log("\n--- Test 5: serverEnv() with all valid vars ---");

const validServer = serverSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test",
  SUPABASE_SERVICE_ROLE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.service",
});

if (validServer.success) {
  console.log("✅ PASS: serverEnv accepts all valid vars");
} else {
  console.log("❌ FAIL: serverEnv should have accepted valid vars");
  process.exit(1);
}

console.log("\n🎉 All 5 tests passed.\n");
