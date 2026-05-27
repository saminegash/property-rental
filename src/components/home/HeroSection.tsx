"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Home as HomeIcon,
  Car,
  Search,
  MapPin,
  BadgeCheck,
  ShieldCheck,
  FileCheck,
  Percent,
  ChevronDown,
} from "lucide-react";

type Tab = "properties" | "cars";

const POPULAR_LOCATIONS = ["Bole", "CMC", "Ayat", "Sarbet", "Kazanchis", "Adama", "Hawassa", "Bahir Dar"];

const FLOATING_BADGES = [
  { icon: BadgeCheck, title: "Verified Listings", subtitle: "Real owners & sellers" },
  { icon: ShieldCheck, title: "Admin Reviewed", subtitle: "Every listing is checked" },
  { icon: FileCheck, title: "Transparent Process", subtitle: "Clear steps, no surprises" },
  { icon: Percent, title: "5% Commission", subtitle: "Only after successful deal" },
] as const;

/**
 * Hero section — property-first marketplace.
 * Left: Headline + search tabs. Right: composite image with floating trust badges.
 * Fully mobile-first: stacks on mobile, side-by-side from lg breakpoint.
 */
export default function HeroSection({
  propertyTypes = [],
}: {
  propertyTypes?: { id: string; name: string }[];
}) {
  const [tab, setTab] = useState<Tab>("properties");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();

    const location = formData.get("location") as string;
    if (location) params.set("location", location);

    if (tab === "properties") {
      const ptype = formData.get("property_type") as string;
      if (ptype) params.set("property_type", ptype);
      const rentSale = formData.get("rent_sale") as string;
      if (rentSale) params.set("type", rentSale);
      const min = formData.get("min_price") as string;
      const max = formData.get("max_price") as string;
      if (min) params.set("min_price", min);
      if (max) params.set("max_price", max);
      router.push(`/properties?${params.toString()}`);
    } else {
      const rentSale = formData.get("rent_sale") as string;
      if (rentSale) params.set("listing_type", rentSale);
      const min = formData.get("min_price") as string;
      const max = formData.get("max_price") as string;
      if (min) params.set("min_price", min);
      if (max) params.set("max_price", max);
      router.push(`/cars?${params.toString()}`);
    }
  }

  const selectClass =
    "w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-3 pr-8 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";
  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

  return (
    <section className="bg-gradient-to-b from-white via-blue-50/30 to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-10">

          {/* LEFT — Headline + search */}
          <div className="flex flex-col">
            <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-3xl lg:text-[2.75rem] lg:leading-[1.15]">
              Find trusted{" "}
              <span className="text-blue-600">properties and cars</span>
              <br className="hidden sm:block" /> across Ethiopia
            </h1>
            <p className="mt-3 text-sm text-slate-600 sm:text-base lg:text-lg">
              Rent, buy, and list properties. Browse or sell cars.
              <br className="hidden sm:block" />
              All in one trusted, admin-reviewed marketplace.
            </p>

            {/* Search card */}
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg sm:p-4">
              {/* Tabs */}
              <div role="tablist" aria-label="Search type" className="flex gap-2">
                <button
                  role="tab"
                  aria-selected={tab === "properties"}
                  onClick={() => setTab("properties")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                    tab === "properties"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <HomeIcon className="h-4 w-4" aria-hidden="true" />
                  Properties
                </button>
                <button
                  role="tab"
                  aria-selected={tab === "cars"}
                  onClick={() => setTab("cars")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                    tab === "cars"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <Car className="h-4 w-4" aria-hidden="true" />
                  Cars
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="mt-3 space-y-3">
                {/* Row 1: Location */}
                <Field label="Location">
                  <div className="relative">
                    <MapPin
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      aria-hidden="true"
                    />
                    <input
                      type="text"
                      name="location"
                      placeholder="Addis Ababa, Bole, CMC..."
                      className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </Field>

                {/* Row 2: Property Type + Rent/Sale (side by side) */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {tab === "properties" && (
                    <Field label="Property Type">
                      <div className="relative">
                        <select name="property_type" className={selectClass}>
                          <option value="">All Types</option>
                          {propertyTypes.length === 0
                            ? ["Apartment", "House", "Villa", "Land", "Commercial", "Condominium"].map((n) => (
                                <option key={n} value={n.toLowerCase()}>{n}</option>
                              ))
                            : propertyTypes.map((p) => (
                                <option key={p.id} value={p.name.toLowerCase()}>{p.name}</option>
                              ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                      </div>
                    </Field>
                  )}

                  <Field label="Rent / Sale">
                    <div className="relative">
                      <select name="rent_sale" className={selectClass}>
                        <option value="">All</option>
                        <option value="rent">Rent</option>
                        <option value="sale">Buy</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                    </div>
                  </Field>
                </div>

                {/* Row 3: Price Range (ETB) — Min & Max side by side */}
                <Field label="Price Range (ETB)">
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <input
                      type="number"
                      name="min_price"
                      placeholder="Min"
                      className={inputClass}
                      min="0"
                    />
                    <span className="text-slate-400 text-xs">—</span>
                    <input
                      type="number"
                      name="max_price"
                      placeholder="Max"
                      className={inputClass}
                      min="0"
                    />
                  </div>
                </Field>

                {/* Search button */}
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                >
                  <Search className="h-4 w-4" aria-hidden="true" />
                  Search {tab === "properties" ? "Properties" : "Cars"}
                </button>
              </form>

              {/* Popular locations */}
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
                <span className="font-medium text-slate-500">Popular:</span>
                {POPULAR_LOCATIONS.map((loc) => (
                  <a
                    key={loc}
                    href={`/${tab === "properties" ? "properties" : "cars"}?location=${encodeURIComponent(loc)}`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    {loc}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — Visual: compact property image + small car overlay + floating badges */}
          <div className="relative hidden sm:block">
            {/* Main property image — compact aspect ratio so hero fits in viewport */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100">
              <Image
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&h=675&q=80"
                alt="Modern property in Ethiopia"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Car thumbnail overlay — bottom-left corner of the main image */}
              <div className="absolute bottom-3 left-3 h-[80px] w-[120px] overflow-hidden rounded-xl shadow-lg ring-2 ring-white sm:h-[90px] sm:w-[140px]">
                <Image
                  src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=320&h=200&q=80"
                  alt="Car for sale in Ethiopia"
                  fill
                  className="object-cover"
                  sizes="140px"
                />
              </div>
            </div>

            {/* Floating badges — positioned on the right edge of the image on lg+ */}
            <div className="mt-3 grid grid-cols-2 gap-2 lg:absolute lg:inset-y-0 lg:right-0 lg:mt-0 lg:flex lg:w-[200px] lg:flex-col lg:justify-center lg:gap-2.5 lg:pr-2">
              {FLOATING_BADGES.map(({ icon: Icon, title, subtitle }) => (
                <div
                  key={title}
                  className="flex items-center gap-2 rounded-xl bg-white/95 backdrop-blur px-2.5 py-2 shadow-md ring-1 ring-slate-200"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 leading-tight">
                    <p className="text-[11px] font-semibold text-slate-900">{title}</p>
                    <p className="text-[10px] text-slate-500">{subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}
