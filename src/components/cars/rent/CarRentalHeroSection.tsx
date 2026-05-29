"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MapPin,
  ChevronDown,
  Calendar,
  UserCheck,
  UserX,
  Car as CarIcon,
  Truck,
  Bus,
  Award,
  Gauge,
  Fuel,
} from "lucide-react";

type Props = {
  carBrands?: { id: string; name: string }[];
};

type DriverOption = "" | "with" | "without";

const BUDGET_OPTIONS = [
  { value: "1500", label: "ETB 1.5k/day" },
  { value: "3000", label: "ETB 3k/day" },
  { value: "5000", label: "ETB 5k/day" },
  { value: "10000", label: "ETB 10k/day" },
  { value: "20000", label: "ETB 20k+/day" },
] as const;

const QUICK_FILTERS = [
  { label: "Sedan", icon: CarIcon, param: { body_type: "sedan" } },
  { label: "SUV", icon: CarIcon, param: { body_type: "suv" } },
  { label: "Van", icon: Bus, param: { body_type: "van" } },
  { label: "Pickup", icon: Truck, param: { body_type: "pickup" } },
  { label: "Luxury", icon: Award, param: { body_type: "luxury" } },
  { label: "Automatic", icon: Gauge, param: { transmission: "automatic" } },
  { label: "Diesel", icon: Fuel, param: { fuel: "diesel" } },
] as const;

export default function CarRentalHeroSection({ carBrands = [] }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [driver, setDriver] = useState<DriverOption>(
    (searchParams.get("driver") as DriverOption) || ""
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    params.set("listing_type", "rent");

    const location = fd.get("location") as string;
    if (location) params.set("location", location);

    const start = fd.get("start_date") as string;
    if (start) params.set("start_date", start);

    const end = fd.get("end_date") as string;
    if (end) params.set("end_date", end);

    const budget = fd.get("budget") as string;
    if (budget) params.set("max_price", budget);

    const brand = fd.get("brand") as string;
    if (brand) params.set("brand", brand);

    if (driver) params.set("driver", driver);

    router.push(`/cars?${params.toString()}`);
  }

  function handleQuickFilter(extra: Record<string, string>) {
    const params = new URLSearchParams({ listing_type: "rent", ...extra });
    router.push(`/cars?${params.toString()}`);
  }

  // Compute min date = today for date inputs
  const today = new Date().toISOString().split("T")[0];

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        {/* Headline */}
        <h1 className="text-center text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          Rent a car you can <span className="text-emerald-600">trust</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-slate-600 sm:text-base">
          Verified vehicles from trusted sellers across Ethiopia. With or without a driver — your choice.
        </p>

        {/* Green Search Card */}
        <div className="mt-6 lg:mt-10 rounded-2xl bg-emerald-600 p-4 sm:p-6 lg:p-8 shadow-lg">
          <form onSubmit={handleSubmit}>
            {/* Driver toggle — prominent at top */}
            <div className="mb-4 lg:mb-6">
              <label className="mb-2 block text-sm font-medium text-white">
                Rental Type
              </label>
              <div className="grid grid-cols-3 gap-2 sm:max-w-md sm:gap-3">
                <DriverPill
                  active={driver === ""}
                  onClick={() => setDriver("")}
                  label="Any"
                  icon={null}
                />
                <DriverPill
                  active={driver === "with"}
                  onClick={() => setDriver("with")}
                  label="With Driver"
                  icon={<UserCheck className="h-3.5 w-3.5" aria-hidden="true" />}
                />
                <DriverPill
                  active={driver === "without"}
                  onClick={() => setDriver("without")}
                  label="Self-Drive"
                  icon={<UserX className="h-3.5 w-3.5" aria-hidden="true" />}
                />
              </div>
            </div>

            {/* Main fields — 4 columns */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {/* Pickup Location */}
              <Field label="Pickup Location">
                <div className="relative">
                  <MapPin
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    name="location"
                    placeholder="Addis Ababa, Bole"
                    defaultValue={searchParams.get("location") || ""}
                    className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </div>
              </Field>

              {/* Start Date */}
              <Field label="Pickup Date">
                <div className="relative">
                  <Calendar
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    type="date"
                    name="start_date"
                    min={today}
                    defaultValue={searchParams.get("start_date") || ""}
                    className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </div>
              </Field>

              {/* End Date */}
              <Field label="Return Date">
                <div className="relative">
                  <Calendar
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    type="date"
                    name="end_date"
                    min={today}
                    defaultValue={searchParams.get("end_date") || ""}
                    className="h-12 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                </div>
              </Field>

              {/* Daily Budget */}
              <Field label="Daily Budget">
                <div className="relative">
                  <select
                    name="budget"
                    defaultValue={searchParams.get("max_price") || ""}
                    className="h-12 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-9 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    <option value="">Any budget</option>
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
              </Field>
            </div>

            {/* Optional brand row + submit */}
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:gap-6">
              <Field label="Brand (optional)">
                <div className="relative">
                  <select
                    name="brand"
                    defaultValue={searchParams.get("brand") || ""}
                    className="h-12 w-full appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-9 text-sm text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    <option value="">Any brand</option>
                    {carBrands.length === 0
                      ? ["Toyota", "Hyundai", "Honda", "Nissan", "Suzuki", "Mercedes-Benz", "BMW", "Ford"].map((n) => (
                          <option key={n} value={n.toLowerCase()}>{n}</option>
                        ))
                      : carBrands.map((b) => (
                          <option key={b.id} value={b.name.toLowerCase()}>{b.name}</option>
                        ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                </div>
              </Field>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-emerald-700 shadow-sm transition-colors hover:bg-emerald-50 sm:w-auto sm:min-w-[180px]"
                >
                  Search Cars
                </button>
              </div>
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
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-emerald-50 hover:text-emerald-700 sm:text-sm"
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
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

function DriverPill({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex h-11 items-center justify-center gap-1.5 rounded-lg text-sm font-semibold transition-colors ${
        active
          ? "bg-white text-emerald-700 shadow-sm"
          : "bg-emerald-700/40 text-white hover:bg-emerald-700/60"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
