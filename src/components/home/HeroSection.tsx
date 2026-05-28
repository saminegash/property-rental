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

const POPULAR_LOCATIONS = [
  "Bole",
  "CMC",
  "Ayat",
  "Sarbet",
  "Kazanchis",
  "Adama",
  "Hawassa",
  "Bahir Dar",
];

const FLOATING_BADGES = [
  {
    icon: BadgeCheck,
    title: "Verified Listings",
    subtitle: "Real owners & sellers",
  },
  {
    icon: ShieldCheck,
    title: "Admin Reviewed",
    subtitle: "Every listing is checked",
  },
  {
    icon: FileCheck,
    title: "Transparent Process",
    subtitle: "Clear steps, no surprises",
  },
  {
    icon: Percent,
    title: "5% Commission",
    subtitle: "Only after successful deal",
  },
] as const;

/**
 * Hero section — property-first marketplace.
 * Two-column layout: Left has headline + search form, Right has composite image with floating trust badges.
 * Stacks on mobile, side-by-side from lg breakpoint.
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
    <section className="hero-section">
      <div className="hero-section__container">
        {/* LEFT — Headline + search */}
        <div className="hero-section__left">
          <h1 className="hero-section__title">
            Find trusted{" "}
            <span className="hero-section__title-accent">
              properties and cars
            </span>
            <br />
            across Ethiopia
          </h1>
          <p className="hero-section__subtitle">
            Rent, buy, and list properties. Browse or sell cars.
            <br />
            All in one trusted, admin-reviewed marketplace.
          </p>

          {/* Search card */}
          <div className="hero-section__search-card">
            {/* Tabs */}
            <div
              role="tablist"
              aria-label="Search type"
              className="hero-section__tabs"
            >
              <button
                role="tab"
                aria-selected={tab === "properties"}
                onClick={() => setTab("properties")}
                className={`hero-section__tab ${
                  tab === "properties" ? "hero-section__tab--active" : ""
                }`}
              >
                <HomeIcon className="h-4 w-4" aria-hidden="true" />
                Properties
              </button>
              <button
                role="tab"
                aria-selected={tab === "cars"}
                onClick={() => setTab("cars")}
                className={`hero-section__tab ${
                  tab === "cars" ? "hero-section__tab--active" : ""
                }`}
              >
                <Car className="h-4 w-4" aria-hidden="true" />
                Cars
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="hero-section__form">
              {/* Row 1: Location */}
              <Field label="Location">
                <div className="hero-section__input-wrap">
                  <MapPin
                    className="hero-section__input-icon"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    name="location"
                    placeholder="Addis Ababa, Bole, CMC..."
                    className="hero-section__input hero-section__input--with-icon"
                  />
                </div>
              </Field>

              {/* Row 2: Property Type + Rent/Sale */}
              <div className="hero-section__row-2col">
                {tab === "properties" && (
                  <Field label="Property Type">
                    <div className="hero-section__select-wrap">
                      <select name="property_type" className={selectClass}>
                        <option value="">All Types</option>
                        {propertyTypes.length === 0
                          ? [
                              "Apartment",
                              "House",
                              "Villa",
                              "Land",
                              "Commercial",
                              "Condominium",
                            ].map((n) => (
                              <option key={n} value={n.toLowerCase()}>
                                {n}
                              </option>
                            ))
                          : propertyTypes.map((p) => (
                              <option key={p.id} value={p.name.toLowerCase()}>
                                {p.name}
                              </option>
                            ))}
                      </select>
                      <ChevronDown
                        className="hero-section__select-chevron"
                        aria-hidden="true"
                      />
                    </div>
                  </Field>
                )}

                <Field label="Rent / Sale">
                  <div className="hero-section__select-wrap">
                    <select name="rent_sale" className={selectClass}>
                      <option value="">All</option>
                      <option value="rent">Rent</option>
                      <option value="sale">Buy</option>
                    </select>
                    <ChevronDown
                      className="hero-section__select-chevron"
                      aria-hidden="true"
                    />
                  </div>
                </Field>
              </div>

              {/* Row 3: Price Range */}
              <Field label="Price Range (ETB)">
                <div className="hero-section__price-row">
                  <input
                    type="number"
                    name="min_price"
                    placeholder="Min"
                    className={inputClass}
                    min="0"
                  />
                  <span className="hero-section__price-sep">—</span>
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
              <button type="submit" className="hero-section__search-btn">
                <Search className="h-4 w-4" aria-hidden="true" />
                Search {tab === "properties" ? "Properties" : "Cars"}
              </button>
            </form>

            {/* Popular locations */}
            <div className="hero-section__popular">
              <span className="hero-section__popular-label">Popular:</span>
              {POPULAR_LOCATIONS.map((loc) => (
                <a
                  key={loc}
                  href={`/${tab === "properties" ? "properties" : "cars"}?location=${encodeURIComponent(loc)}`}
                  className="hero-section__popular-link"
                >
                  {loc}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — Composite image with floating badges */}
        <div className="hero-section__right">
          <div className="hero-section__image-container">
            {/* Main property image */}
            <div className="hero-section__main-image">
              <Image
                src="/luxury.jpg"
                alt="Modern property in Ethiopia"
                fill
                priority
                className="hero-section__img"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Car thumbnail overlay */}
              <div className="hero-section__car-thumb">
                <Image
                  src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=320&h=200&q=80"
                  alt="Car for sale in Ethiopia"
                  fill
                  className="hero-section__img"
                  sizes="140px"
                />
              </div>
            </div>

            {/* Floating trust badges — overlaid on the image */}
            <div className="hero-section__badges">
              {FLOATING_BADGES.map(({ icon: Icon, title, subtitle }) => (
                <div key={title} className="hero-section__badge">
                  <div className="hero-section__badge-icon">
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </div>
                  <div className="hero-section__badge-text">
                    <p className="hero-section__badge-title">{title}</p>
                    <p className="hero-section__badge-sub">{subtitle}</p>
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="hero-section__field">
      <span className="hero-section__field-label">{label}</span>
      {children}
    </label>
  );
}
