"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MapPin,
  ChevronDown,
  Building2,
  Home,
  Castle,
  Sofa,
  Users,
  Bus,
  BadgeCheck,
} from "lucide-react";

type Props = {
  propertyTypes?: { id: string; name: string }[];
};

const BUDGET_OPTIONS = [
  { value: "10000", label: "ETB 10k" },
  { value: "20000", label: "ETB 20k" },
  { value: "30000", label: "ETB 30k" },
  { value: "50000", label: "ETB 50k" },
  { value: "100000", label: "ETB 100k+" },
] as const;

const QUICK_FILTERS = [
  { label: "Apartments", icon: Building2, param: { property_type: "apartment" } },
  { label: "Houses", icon: Home, param: { property_type: "house" } },
  { label: "Villas", icon: Castle, param: { property_type: "villa" } },
  { label: "Furnished", icon: Sofa, param: { furnished: "true" } },
  { label: "Family Homes", icon: Users, param: { family: "true" } },
  { label: "Near Transport", icon: Bus, param: { near_transport: "true" } },
  { label: "Verified Owners", icon: BadgeCheck, param: { verified: "true" } },
] as const;

export default function RentHeroSection({ propertyTypes = [] }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bedrooms, setBedrooms] = useState<string>(searchParams.get("bedrooms") || "");

  function handleBedrooms(value: string) {
    setBedrooms(value);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    params.set("listing_type", "rent");

    const location = fd.get("location") as string;
    if (location) params.set("location", location);

    const budget = fd.get("budget") as string;
    if (budget) params.set("max_price", budget);

    if (bedrooms) params.set("bedrooms", bedrooms);

    const ptype = fd.get("property_type") as string;
    if (ptype) params.set("property_type", ptype);

    router.push(`/properties?${params.toString()}`);
  }

  function handleQuickFilter(extra: Record<string, string>) {
    const params = new URLSearchParams({ listing_type: "rent", ...extra });
    router.push(`/properties?${params.toString()}`);
  }

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        {/* Headline */}
        <h1 className="text-center text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Find rental properties you can trust
        </h1>

        {/* Blue Search Card */}
        <div className="mt-6 lg:mt-10 rounded-2xl bg-blue-600 p-4 sm:p-6 lg:p-8 shadow-lg">
          <form onSubmit={handleSubmit}>
            {/* Top row — 4 fields */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {/* Location */}
              <Field label="Location">
                <div className="relative">
                  <MapPin
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    name="location"
                    placeholder="Addis Ababa, Ethiopia"
                    defaultValue={searchParams.get("location") || ""}
                    className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </div>
              </Field>

              {/* Monthly Budget */}
              <Field label="Monthly Budget">
                <div className="relative">
                  <select
                    name="budget"
                    defaultValue={searchParams.get("max_price") || ""}
                    className="h-12 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-9 text-sm text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    <option value="">ETB 10k – 50k+</option>
                    {BUDGET_OPTIONS.map((b) => (
                      <option key={b.value} value={b.value}>
                        Up to {b.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-1 text-[11px] text-blue-100">ETB 10k - 50k+</p>
              </Field>

              {/* Bedrooms — segmented control */}
              <Field label="Bedrooms">
                <div className="flex h-12 items-center gap-2 rounded-lg bg-white px-2">
                  {["1", "2", "3+"].map((opt) => {
                    const isActive = bedrooms === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleBedrooms(opt)}
                        className={`flex h-9 flex-1 items-center justify-center rounded-md text-sm font-semibold transition-colors ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </Field>

              {/* Property Type */}
              <Field label="Property Type">
                <div className="relative">
                  <select
                    name="property_type"
                    defaultValue={searchParams.get("property_type") || ""}
                    className="h-12 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-9 text-sm text-slate-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    <option value="">Apartment, House, Villa</option>
                    {propertyTypes.length === 0
                      ? ["Apartment", "House", "Villa", "Condominium", "Studio"].map((n) => (
                          <option key={n} value={n.toLowerCase()}>{n}</option>
                        ))
                      : propertyTypes.map((p) => (
                          <option key={p.id} value={p.name.toLowerCase()}>{p.name}</option>
                        ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                </div>
              </Field>
            </div>

            {/* Divider */}
            <div className="my-4 lg:my-6 h-px bg-white/20" />

            {/* Quick filter chips */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {QUICK_FILTERS.map(({ label, icon: Icon, param }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleQuickFilter(param)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-blue-50 hover:text-blue-600 sm:text-sm"
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>

            {/* Hidden submit — form is submitted via Enter or you can add a visible button */}
            <button type="submit" className="sr-only">Search</button>
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-white">
        {label}
      </label>
      {children}
    </div>
  );
}
