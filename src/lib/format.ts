/**
 * Shared formatting utilities for the marketplace.
 *
 * Import from `@/lib/format` everywhere instead of using
 * inline `.toLocaleString()` or `Intl.NumberFormat` calls.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

/** Shape of the JSONB `details` column on the `listings` table. */
export interface ListingDetails {
  bedrooms?: number | null;
  bathrooms?: number | null;
  area_sqm?: number | null;
  floors?: number | null;
  year_built?: number | null;
  parking_spaces?: number | null;
  [key: string]: unknown; // allow future fields without `any`
}

// ─── Number / Price Formatting ───────────────────────────────────────────────

/**
 * Format a number into a compact, human-readable string.
 *
 * Examples:
 *   formatCompactNumber(30_000_000)  → "30M"
 *   formatCompactNumber(2_500_000)   → "2.5M"
 *   formatCompactNumber(150_000)     → "150K"
 *   formatCompactNumber(30_000)      → "30K"
 *   formatCompactNumber(8_500)       → "8,500"
 *   formatCompactNumber(500)         → "500"
 */
export function formatCompactNumber(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 1_000_000_000) {
    const n = abs / 1_000_000_000;
    return `${sign}${stripTrailingZero(n)}B`;
  }
  if (abs >= 1_000_000) {
    const n = abs / 1_000_000;
    return `${sign}${stripTrailingZero(n)}M`;
  }
  if (abs >= 10_000) {
    const n = abs / 1_000;
    return `${sign}${stripTrailingZero(n)}K`;
  }

  return `${sign}${abs.toLocaleString()}`;
}

/**
 * Format a price with the compact suffix and currency label.
 *
 * Examples:
 *   formatPrice(30_000_000)  → "30M ETB"
 *   formatPrice(150_000)     → "150K ETB"
 *   formatPrice(8_500)       → "8,500 ETB"
 */
export function formatPrice(value: number, currency = "ETB"): string {
  return `${formatCompactNumber(value)} ${currency}`;
}

/**
 * Full-precision currency format for dashboards and financial pages.
 *
 * Example:
 *   formatCurrency(1_234_567) → "ETB 1,234,567"
 */
export function formatCurrency(amount: number, currency = "ETB"): string {
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Remove unnecessary trailing ".0" from a rounded number string. */
function stripTrailingZero(n: number): string {
  // Show at most 1 decimal place
  const fixed = n.toFixed(1);
  return fixed.endsWith(".0") ? fixed.slice(0, -2) : fixed;
}
