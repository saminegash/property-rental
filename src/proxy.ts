import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { clientEnv } from "@/lib/env/client";

/* ── Locale helpers ── */
const LOCALES = ["en", "am"] as const;
type Locale = (typeof LOCALES)[number];
const DEFAULT_LOCALE: Locale = "en";

function getPathnameLocale(pathname: string): Locale | null {
  const found = LOCALES.find(
    (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
  );
  return found ?? null;
}

function getPreferredLocale(request: NextRequest): Locale {
  // 1. Explicit cookie
  const cookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookie && LOCALES.includes(cookie as Locale)) return cookie as Locale;

  // 2. Accept-Language header (simple check for "am")
  const accept = request.headers.get("accept-language") ?? "";
  if (accept.includes("am")) return "am";

  return DEFAULT_LOCALE;
}

/**
 * Strip the locale prefix from a pathname so auth checks work uniformly.
 * e.g. "/en/dashboard/owner" → "/dashboard/owner"
 */
function stripLocale(pathname: string): string {
  for (const l of LOCALES) {
    if (pathname.startsWith(`/${l}/`)) return pathname.slice(l.length + 1);
    if (pathname === `/${l}`) return "/";
  }
  return pathname;
}

/**
 * Middleware that runs on every matched request.
 *
 * Responsibilities:
 * 1. Detect / redirect to locale-prefixed URL.
 * 2. Refresh the Supabase auth session (token rotation).
 * 3. Redirect unauthenticated users away from protected routes.
 * 4. Redirect authenticated users away from auth pages.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /* ── 1. Locale redirect ── */
  const pathLocale = getPathnameLocale(pathname);

  if (!pathLocale) {
    const locale = getPreferredLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(url);
  }

  // The "clean" path without the locale prefix (for auth checks below)
  const cleanPath = stripLocale(pathname);

  /* ── 2. Supabase session refresh ── */
  const env = clientEnv();

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Set cookies on the request (for downstream server code)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );

          // Create a new response that carries the updated cookies
          supabaseResponse = NextResponse.next({
            request,
          });

          // Set cookies on the response (for the browser)
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do not use getSession() for auth checks — it reads
  // unverified cookie data. getUser() contacts the Auth server.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  /* ── 3. Protected route redirect ── */
  if (
    (cleanPath.startsWith("/dashboard") || cleanPath.startsWith("/admin")) &&
    !user
  ) {
    const url = request.nextUrl.clone();
    url.pathname = `/${pathLocale}/login`;
    return NextResponse.redirect(url);
  }

  /* ── 4. Auth page redirect ── */
  if ((cleanPath === "/login" || cleanPath === "/signup") && user) {
    const url = request.nextUrl.clone();
    url.pathname = `/${pathLocale}/dashboard`;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - Public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
