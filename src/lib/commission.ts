/**
 * Single source of truth for MyEthioProperties commission rates.
 *
 * Change values here and the entire app reflects them.
 *
 * Rate semantics:
 *   - `sale`: flat 1.2% on the deal amount.
 *   - `rent`: variable 5–8%. Each commission row stores its own
 *     `commission_rate` in `public.commissions`, so the schema natively
 *     supports per-deal rates within the range.
 */

export const COMMISSION = {
  sale: {
    /** 0.012 = 1.2% */
    rate: 0.012,
    label: "1.2%",
  },
  rent: {
    /** Default rate used when admin doesn't override (mid-point of 5–8%). */
    defaultRate: 0.065,
    min: 0.05,
    max: 0.08,
    label: "5–8%",
  },
} as const;

/**
 * Marketing-ready strings. Re-use these so we never drift between surfaces.
 */
export const COMMISSION_COPY = {
  /** Used in the announcement bar above the header. */
  short: `${COMMISSION.sale.label} Sales · ${COMMISSION.rent.label} Rent`,
  /** Used in hero floating badge, trust card, etc. */
  badgeTitle: "Low Commission",
  /** Subtitle/description for badges & cards. */
  badgeSubtitle: `${COMMISSION.sale.label} sales · ${COMMISSION.rent.label} rent`,
  /** Longer description for sections that have room. */
  description: `${COMMISSION.sale.label} on sales, ${COMMISSION.rent.label} on rent — only after a successful deal.`,
  /** Used in <head> meta descriptions. */
  meta: `${COMMISSION.sale.label} commission on sales and ${COMMISSION.rent.label} on rent, charged only after a successful deal.`,
  /** Used on the signup pricing callout. */
  signupCalloutTitle: `Transparent Pricing: ${COMMISSION.sale.label} Sales · ${COMMISSION.rent.label} Rent`,
  signupCalloutBody:
    "MyEthioProperties commission only after a successful safe deal.",
} as const;

/**
 * Format a stored rate (0.06) as a display string ("6.0%").
 * Use this for per-row displays in the earnings table.
 */
export function formatRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}
