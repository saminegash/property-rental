import Link from "next/link";
import { MapPin, Search, ArrowRight } from "lucide-react";

const LOCATIONS = [
  "Addis Ababa", "Bole", "CMC", "Ayat", "Sarbet",
  "Kazanchis", "Adama", "Hawassa", "Bahir Dar",
] as const;

interface PopularSearchedDict {
  popularLocations: string;
  exploreAll: string;
  topSearched: string;
  seeAll: string;
  apartmentsForRent: string;
  housesForSale: string;
  landForSale: string;
  toyotaCars: string;
  suvs: string;
  officeSpaces: string;
}

export default function PopularAndSearchedSection({
  dict,
  lang,
}: {
  dict: PopularSearchedDict;
  lang: string;
}) {
  const TOP_CATEGORIES = [
    { label: dict.apartmentsForRent, href: `/${lang}/rent?property_type=apartment` },
    { label: dict.housesForSale, href: `/${lang}/trade?property_type=house` },
    { label: dict.landForSale, href: `/${lang}/trade?property_type=land` },
    { label: dict.toyotaCars, href: `/${lang}/rent?property_type=vehicle` },
    { label: dict.suvs, href: `/${lang}/rent?property_type=vehicle` },
    { label: dict.officeSpaces, href: `/${lang}/rent?property_type=commercial` },
  ];

  return (
    <section className="bg-white py-10 lg:py-14">
      <div className="mx-auto px-4 sm:px-6">
        <div className="grid gap-8 md:grid-cols-2 lg:gap-10">

          {/* Popular Locations */}
          <div>
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 sm:text-lg">
              <MapPin className="h-4 w-4 text-blue-600" aria-hidden="true" />
              {dict.popularLocations}
            </h3>

            <div className="mt-4 flex flex-wrap gap-2">
              {LOCATIONS.map((loc) => (
                <Link
                  key={loc}
                  href={`/${lang}/rent?location=${encodeURIComponent(loc)}`}
                  className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-700 shadow-sm hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors sm:text-sm"
                >
                  {loc}
                </Link>
              ))}
            </div>

            <Link
              href={`/${lang}/rent`}
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:gap-2 transition-all sm:text-sm"
            >
              {dict.exploreAll}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          {/* Top Searched Categories */}
          <div>
            <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 sm:text-lg">
              <Search className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              {dict.topSearched}
            </h3>

            <div className="mt-4 flex flex-wrap gap-2">
              {TOP_CATEGORIES.map((cat) => (
                <Link
                  key={cat.label}
                  href={cat.href}
                  className="inline-flex items-center rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-700 shadow-sm hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors sm:text-sm"
                >
                  {cat.label}
                </Link>
              ))}
            </div>

            <Link
              href={`/${lang}/rent`}
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:gap-2 transition-all sm:text-sm"
            >
              {dict.seeAll}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
