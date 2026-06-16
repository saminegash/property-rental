"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Home as HomeIcon,
  Car,
  Search,
  MapPin,
  ChevronDown,
} from "lucide-react";

type Tab = "rent" | "sale";

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

interface HeroDict {
  title: string;
  titleAccent: string;
  titleSuffix: string;
  subtitle: string;
  subtitleLine2: string;
  tabRent: string;
  tabBuy: string;
  locationLabel: string;
  locationPlaceholder: string;
  typeLabel: string;
  allTypes: string;
  typeApartment: string;
  typeHouse: string;
  typeVilla: string;
  typeLand: string;
  typeCommercial: string;
  typeCondominium: string;
  typeVehicle: string;
  priceRangeLabel: string;
  minPlaceholder: string;
  maxPlaceholder: string;
  searchRentals: string;
  searchListings: string;
  popular: string;
  imageAlt: string;
}

/**
 * Hero section — unified marketplace.
 */
export default function HeroSection({
  dict,
  lang,
}: {
  dict: HeroDict;
  lang: string;
}) {
  const [tab, setTab] = useState<Tab>("rent");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();

    const location = formData.get("location") as string;
    if (location) params.set("location", location);

    const ptype = formData.get("property_type") as string;
    if (ptype) params.set("property_type", ptype);

    const min = formData.get("min_price") as string;
    const max = formData.get("max_price") as string;
    if (min) params.set("min_price", min);
    if (max) params.set("max_price", max);

    if (tab === "rent") {
      router.push(`/${lang}/rent?${params.toString()}`);
    } else {
      router.push(`/${lang}/trade?${params.toString()}`);
    }
  }

  const selectClass =
    "w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-3 pr-8 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";
  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

  const PROPERTY_TYPES = [
    { value: "apartment", label: dict.typeApartment },
    { value: "house", label: dict.typeHouse },
    { value: "villa", label: dict.typeVilla },
    { value: "land", label: dict.typeLand },
    { value: "commercial", label: dict.typeCommercial },
    { value: "condominium", label: dict.typeCondominium },
    { value: "vehicle", label: dict.typeVehicle },
  ];

  return (
    <section className="hero-section">
      <div className="hero-section__container">
        {/* LEFT — Headline + search */}
        <div className="hero-section__left">
          <h1 className="hero-section__title">
            {dict.title}{" "}
            <span className="hero-section__title-accent">
              {dict.titleAccent}
            </span>
            <br />
            {dict.titleSuffix}
          </h1>
          <p className="hero-section__subtitle">
            {dict.subtitle}
            <br />
            {dict.subtitleLine2}
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
                aria-selected={tab === "rent"}
                onClick={() => setTab("rent")}
                className={`hero-section__tab ${
                  tab === "rent" ? "hero-section__tab--active" : ""
                }`}
              >
                <HomeIcon className="h-4 w-4" aria-hidden="true" />
                {dict.tabRent}
              </button>
              <button
                role="tab"
                aria-selected={tab === "sale"}
                onClick={() => setTab("sale")}
                className={`hero-section__tab ${
                  tab === "sale" ? "hero-section__tab--active" : ""
                }`}
              >
                <Car className="h-4 w-4" aria-hidden="true" />
                {dict.tabBuy}
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="hero-section__form">
              {/* Row 1: Location */}
              <Field label={dict.locationLabel}>
                <div className="hero-section__input-wrap">
                  <MapPin
                    className="hero-section__input-icon"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    name="location"
                    placeholder={dict.locationPlaceholder}
                    className="hero-section__input hero-section__input--with-icon"
                  />
                </div>
              </Field>

              {/* Property Type */}
              <Field label={dict.typeLabel}>
                <div className="hero-section__select-wrap">
                  <select name="property_type" className={selectClass}>
                    <option value="">{dict.allTypes}</option>
                    {PROPERTY_TYPES.map((pt) => (
                      <option key={pt.value} value={pt.value}>
                        {pt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="hero-section__select-chevron"
                    aria-hidden="true"
                  />
                </div>
              </Field>

              {/* Price Range */}
              <Field label={dict.priceRangeLabel}>
                <div className="hero-section__price-row">
                  <input
                    type="number"
                    name="min_price"
                    placeholder={dict.minPlaceholder}
                    className={inputClass}
                    min="0"
                  />
                  <span className="hero-section__price-sep">—</span>
                  <input
                    type="number"
                    name="max_price"
                    placeholder={dict.maxPlaceholder}
                    className={inputClass}
                    min="0"
                  />
                </div>
              </Field>

              {/* Search button */}
              <button type="submit" className="hero-section__search-btn">
                <Search className="h-4 w-4" aria-hidden="true" />
                {tab === "rent" ? dict.searchRentals : dict.searchListings}
              </button>
            </form>

            {/* Popular locations */}
            <div className="hero-section__popular">
              <span className="hero-section__popular-label">{dict.popular}</span>
              {POPULAR_LOCATIONS.map((loc) => (
                <a
                  key={loc}
                  href={`/${lang}/${tab === "rent" ? "rent" : "trade"}?location=${encodeURIComponent(loc)}`}
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
                alt={dict.imageAlt}
                fill
                priority
                className="hero-section__img"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
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
