import { headers } from "next/headers";
import { LOCALES, DEFAULT_LOCALE, type Locale } from "@/app/[lang]/dictionaries";

/**
 * Extract the current locale from the request URL pathname.
 * Works in server components and server actions.
 */
export async function getCurrentLocale(): Promise<Locale> {
  const headerList = await headers();
  const url = headerList.get("x-url") || headerList.get("referer") || "";

  for (const locale of LOCALES) {
    if (url.includes(`/${locale}/`) || url.endsWith(`/${locale}`)) {
      return locale;
    }
  }

  // Fallback: try to extract from next-url header
  const nextUrl = headerList.get("x-next-url") || "";
  for (const locale of LOCALES) {
    if (nextUrl.startsWith(`/${locale}/`) || nextUrl === `/${locale}`) {
      return locale;
    }
  }

  return DEFAULT_LOCALE;
}

/**
 * Create a locale-prefixed path.
 * Usage: localePath("/dashboard", "en") → "/en/dashboard"
 */
export function localePath(path: string, locale: Locale): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${cleanPath}`;
}
