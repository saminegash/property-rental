import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { clientEnv } from "@/lib/env/client";

/**
 * Middleware that runs on every matched request.
 *
 * Responsibilities:
 * 1. Refresh the Supabase auth session (token rotation).
 * 2. Redirect unauthenticated users away from protected routes.
 * 3. Redirect authenticated users away from auth pages.
 */
export async function proxy(request: NextRequest) {
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

  const { pathname } = request.nextUrl;

  // Protected routes: redirect to login if not authenticated
  if ((pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Auth routes: redirect to dashboard if already authenticated
  if ((pathname === "/login" || pathname === "/signup") && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
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
