import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import { CarCard } from "@/components/shared/CarCard";
import { PropertyCard } from "@/components/shared/PropertyCard";
import {
  getSponsoredListings,
  getMixedListings,
} from "@/lib/listings/hub";

type Props = {
  surface: "rent_hub" | "buy_hub" | "home";
  listingType: "rent" | "sale";
  viewAllHref: string;
  title?: string;
  subtitle?: string;
};

/**
 * Featured / Sponsored strip. Pulls from `sponsored_slots` (paid / first-come),
 * ordered by position. If no slots are filled yet, gracefully falls back to a
 * mixed set of editorially-featured listings so the section is never empty
 * during launch ("first comers first" — slots fill up over time).
 */
export async function SponsoredStrip({
  surface,
  listingType,
  viewAllHref,
  title = "Featured & Sponsored",
  subtitle = "Promoted listings from verified owners — a mix of properties and cars.",
}: Props) {
  let listings = await getSponsoredListings(surface, listingType, 8);
  let sponsored = listings.length > 0;

  if (listings.length === 0) {
    // Launch fallback: show editorially-featured mixed listings.
    listings = await getMixedListings({ listingType, category: "both", limit: 8 });
    sponsored = false;
  }

  if (listings.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 py-10 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-300">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {sponsored ? "Sponsored" : "Featured"}
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {title}
            </h2>
            <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
          </div>
          <Link
            href={viewAllHref}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-amber-300 transition-all hover:gap-2"
          >
            View All <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-8 lg:grid-cols-4">
          {listings.map((l) =>
            l.kind === "car" ? (
              <CarCard
                key={l.id}
                id={l.id}
                title={l.title}
                location={l.location}
                image={l.image}
                price={l.price}
                type={l.type}
                mileage={l.mileage}
                transmission={l.transmission}
                isVerified={l.isVerified}
                href={l.href}
              />
            ) : (
              <PropertyCard
                key={l.id}
                id={l.id}
                title={l.title}
                location={l.location}
                image={l.image}
                price={l.price}
                type={l.type}
                beds={l.beds}
                baths={l.baths}
                area={l.area}
                isVerified={l.isVerified}
                href={l.href}
              />
            ),
          )}
        </div>
      </div>
    </section>
  );
}
