import Link from "next/link";
import { ArrowRight, LayoutGrid } from "lucide-react";
import { CarCard } from "@/components/shared/CarCard";
import { PropertyCard } from "@/components/shared/PropertyCard";
import {
  getMixedListings,
  type MixedListingOptions,
} from "@/lib/listings/hub";

type Props = MixedListingOptions & {
  title: string;
  subtitle?: string;
  viewAllHref: string;
  background?: "white" | "slate";
  /** Hide entirely when empty (used for optional rows) */
  hideWhenEmpty?: boolean;
};

/**
 * One section, any mix. Renders cars and properties in a single responsive
 * grid using the existing shared cards. Featured items float to the top.
 */
export async function MixedListingsSection({
  title,
  subtitle,
  viewAllHref,
  background = "white",
  hideWhenEmpty = false,
  ...opts
}: Props) {
  const listings = await getMixedListings(opts);

  if (listings.length === 0 && hideWhenEmpty) return null;

  const bg = background === "slate" ? "bg-slate-50" : "bg-white";

  return (
    <section className={`${bg} py-10 lg:py-14`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {title}
            </h2>
            {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
          </div>
          <Link
            href={viewAllHref}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-blue-600 transition-all hover:gap-2"
          >
            View All <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {listings.length > 0 ? (
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
        ) : (
          <EmptyState viewAllHref={viewAllHref} />
        )}
      </div>
    </section>
  );
}

function EmptyState({ viewAllHref }: { viewAllHref: string }) {
  return (
    <div className="mt-8 flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
        <LayoutGrid className="h-7 w-7 text-blue-600" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">
        Nothing here yet
      </h3>
      <p className="mt-2 max-w-md text-sm text-slate-600">
        We&apos;re onboarding more verified owners. Check back soon.
      </p>
      <Link
        href={viewAllHref}
        className="mt-4 inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        Browse All
      </Link>
    </div>
  );
}
