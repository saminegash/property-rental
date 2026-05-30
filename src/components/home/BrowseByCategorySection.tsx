import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  Home,
  Castle,
  Trees,
  Store,
  Car,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type Category = {
  title: string;
  description: string;
  image: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  dbKey?: string; // matches property_types.name in DB; omit for "Cars"
};

const CATEGORIES: Category[] = [
  {
    title: "Apartments",
    description: "Modern & affordable apartment units",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&h=300&q=80",
    href: "/trade?property_type=apartment",
    icon: Building2,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    dbKey: "Apartment",
  },
  {
    title: "Houses",
    description: "Comfortable homes for families",
    image:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=400&h=300&q=80",
    href: "/trade?property_type=house",
    icon: Home,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    dbKey: "House",
  },
  {
    title: "Villas",
    description: "Luxury villas with premium living",
    image:
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=400&h=300&q=80",
    href: "/trade?property_type=villa",
    icon: Castle,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    dbKey: "Villa",
  },
  {
    title: "Land",
    description: "Residential & commercial land for sale",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&h=300&q=80",
    href: "/trade?property_type=land",
    icon: Trees,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
    dbKey: "Land",
  },
  {
    title: "Commercial",
    description: "Offices, shops & commercial spaces",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&h=300&q=80",
    href: "/trade?property_type=commercial",
    icon: Store,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
    dbKey: "Commercial",
  },
  {
    title: "Cars",
    description: "Sedans, SUVs & more from trusted sellers",
    image:
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&h=300&q=80",
    href: "/trade?property_type=vehicle",
    icon: Car,
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
  },
];

export default async function BrowseByCategorySection() {
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
          Browse by Category
        </h2>
        <p className="mt-2 text-sm text-slate-600 text-center mb-8">
          Find exactly what you are looking for
        </p>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((cat) => {
            const count = cat.dbKey ? counts[cat.dbKey] || 0 : carCount || 0;
            const Icon = cat.icon;
            
            return (
              <Link
                key={cat.title}
                href={cat.href}
                className="group flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
              >
                <div
                  className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 ${cat.iconBg} ${cat.iconColor}`}
                >
                  <Icon className="h-7 w-7" aria-hidden="true" />
                </div>
                <h3 className="mb-1 text-sm font-bold text-slate-900">
                  {cat.title}
                </h3>
                <p className="text-xs font-medium text-slate-500">
                  {count} {count === 1 ? "Listing" : "Listings"}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
