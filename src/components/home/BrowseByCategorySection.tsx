import Link from "next/link";
import Image from "next/image";
import { Building2, Home, Castle, Trees, Store, Car } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

interface BrowseCategoryDict {
  title: string;
  subtitle: string;
  apartments: string;
  apartmentsDesc: string;
  houses: string;
  housesDesc: string;
  villas: string;
  villasDesc: string;
  landTitle: string;
  landDesc: string;
  commercialTitle: string;
  commercialDesc: string;
  cars: string;
  carsDesc: string;
  listing: string;
  listings: string;
}

type CategoryDef = {
  titleKey: keyof BrowseCategoryDict;
  descKey: keyof BrowseCategoryDict;
  image: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  dbKey?: string;
};

const CATEGORIES: CategoryDef[] = [
  {
    titleKey: "apartments",
    descKey: "apartmentsDesc",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&h=300&q=80",
    href: "/trade?property_type=apartment",
    icon: Building2,
    dbKey: "Apartment",
  },
  {
    titleKey: "houses",
    descKey: "housesDesc",
    image:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=400&h=300&q=80",
    href: "/trade?property_type=house",
    icon: Home,
    dbKey: "House",
  },
  {
    titleKey: "villas",
    descKey: "villasDesc",
    image:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=400&h=300&q=80",
    href: "/trade?property_type=villa",
    icon: Castle,
    dbKey: "Villa",
  },
  {
    titleKey: "landTitle",
    descKey: "landDesc",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&h=300&q=80",
    href: "/trade?property_type=land",
    icon: Trees,
    dbKey: "Land",
  },
  {
    titleKey: "commercialTitle",
    descKey: "commercialDesc",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&h=300&q=80",
    href: "/trade?property_type=commercial",
    icon: Store,
    dbKey: "Commercial",
  },
  {
    titleKey: "cars",
    descKey: "carsDesc",
    image:
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&h=300&q=80",
    href: "/trade?property_type=vehicle",
    icon: Car,
  },
];

export default async function BrowseByCategorySection({
  dict,
  lang,
}: {
  dict: BrowseCategoryDict;
  lang: string;
}) {
  // Count from DB for all listing types
  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("listings")
    .select("property_type")
    .eq("status", "published");

  const counts: Record<string, number> = {};
  if (listings) {
    for (const listing of listings) {
      const type = listing.property_type;
      const key = type.charAt(0).toUpperCase() + type.slice(1);
      counts[key] = (counts[key] || 0) + 1;
    }
  }

  const carCount = counts["Vehicle"] || 0;

  return (
    <section className="bg-white py-12 lg:py-16">
      <div className="mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl text-center">
          {dict.title}
        </h2>
        <p className="mt-2 text-sm text-slate-600 text-center mb-8">
          {dict.subtitle}
        </p>

        <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:mt-8 lg:grid-cols-6">
          {CATEGORIES.map((cat) => {
            const count = cat.dbKey ? counts[cat.dbKey] || 0 : carCount || 0;
            const Icon = cat.icon;
            const title = dict[cat.titleKey];
            return (
              <Link
                key={cat.titleKey}
                href={`/${lang}${cat.href}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
              >
                <div className="relative h-28 w-full overflow-hidden bg-slate-100 sm:h-32">
                  <Image
                    src={cat.image}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 17vw"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/20 backdrop-blur-md`}
                    >
                      <Icon
                        className="h-3.5 w-3.5 text-white"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                    {title}
                  </h3>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-[11px] text-slate-500">
                      {count} {count === 1 ? dict.listing : dict.listings}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
