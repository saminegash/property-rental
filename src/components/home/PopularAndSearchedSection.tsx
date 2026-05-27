import Link from "next/link";
import { MapPin, Search, ArrowRight } from "lucide-react";

const LOCATIONS = [
  "Addis Ababa", "Bole", "CMC", "Ayat", "Sarbet",
  "Kazanchis", "Adama", "Hawassa", "Bahir Dar",
] as const;

const TOP_CATEGORIES = [
  { label: "Apartments for Rent", href: "/properties?type=Apartment&listing_type=rent" },
  { label: "Houses for Sale", href: "/properties?type=House&listing_type=sale" },
  { label: "Land for Sale", href: "/properties?type=Land&listing_type=sale" },
  { label: "Toyota Cars", href: "/cars?brand=Toyota" },
  { label: "SUVs", href: "/cars?body=SUV" },
  { label: "Office Spaces", href: "/properties?type=Commercial" },
] as const;

export default function PopularAndSearchedSection() {
  return (
    <section className="bg-white py-10 lg:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:gap-10">

          {/* Popular Locations */}
          <div>
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 sm:text-lg">
              <MapPin className="h-4 w-4 text-blue-600" aria-hidden="true" />
              Popular Locations
            </h3>

            <div className="mt-4 flex flex-wrap gap-2">
              {LOCATIONS.map((loc) => (
                <Link
                  key={loc}
                  href={`/properties?location=${encodeURIComponent(loc)}`}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-colors sm:text-sm"
                >
                  {loc}
                </Link>
              ))}
            </div>

            <Link
              href="/properties"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:gap-2 transition-all sm:text-sm"
            >
              Explore all locations
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {/* Top Searched Categories */}
          <div>
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 sm:text-lg">
              <Search className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              Top Searched Categories
            </h3>

            <div className="mt-4 flex flex-wrap gap-2">
              {TOP_CATEGORIES.map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:border-emerald-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors sm:text-sm"
                >
                  {cat.label}
                </Link>
              ))}
            </div>

            <Link
              href="/properties"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:gap-2 transition-all sm:text-sm"
            >
              See all categories
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
