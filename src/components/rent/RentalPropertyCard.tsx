"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { MapPin, Bed, Bath, Maximize2, Heart } from "lucide-react";

export type RentalPropertyCardProps = {
  id: string;
  title: string;
  location: string;
  image: string;
  monthlyRent: number;
  beds?: number;
  baths?: number;
  area?: number; // sqm
  isAvailableNow?: boolean;
  isVerified?: boolean;
  depositMonths?: number; // e.g. 1 → "Deposit: 1 Month"
  href?: string;
};

/**
 * Rental property card matching the rent page design.
 * - Top-left: green "Available Now" badge
 * - Top-right: heart (save/favorite) button
 * - Mid-overlay: blue "Verified" pill on image bottom-left
 * - Price line with optional deposit info
 * - Bottom: outlined "Request Viewing" button
 */
export function RentalPropertyCard({
  id,
  title,
  location,
  image,
  monthlyRent,
  beds,
  baths,
  area,
  isAvailableNow = true,
  isVerified = false,
  depositMonths,
  href,
}: RentalPropertyCardProps) {
  const [saved, setSaved] = useState(false);
  const detailHref = href || `/properties/${id}`;

  function handleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSaved((s) => !s);
    // TODO: hit /api/saved endpoint
  }

  return (
    <Link
      href={detailHref}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      {/* Image area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <Image
          src={image || "/placeholder-property.jpg"}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
        />

        {/* Available Now badge — top-left */}
        {isAvailableNow && (
          <span className="absolute left-3 top-3 inline-flex items-center rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
            Available Now
          </span>
        )}

        {/* Save heart — top-right */}
        <button
          type="button"
          onClick={handleSave}
          aria-label={saved ? "Remove from saved" : "Save property"}
          aria-pressed={saved}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 backdrop-blur shadow-sm transition-colors hover:bg-white"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              saved ? "fill-red-500 text-red-500" : "text-slate-600"
            }`}
            aria-hidden="true"
          />
        </button>

        {/* Verified pill — bottom-left on image */}
        {isVerified && (
          <span className="absolute bottom-3 left-3 inline-flex items-center rounded-md bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
            Verified
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {/* Price + deposit */}
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-base font-bold text-blue-600 sm:text-lg">
            ETB {monthlyRent.toLocaleString()}
            <span className="text-xs font-medium text-slate-500"> / month</span>
          </p>
          {depositMonths && depositMonths > 0 && (
            <p className="text-[11px] text-slate-500">
              Deposit: {depositMonths} Month{depositMonths > 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Title */}
        <h3 className="mt-2 line-clamp-1 text-sm font-semibold text-slate-900 sm:text-base">
          {title}
        </h3>

        {/* Location */}
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
          <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span className="truncate">{location}</span>
        </p>

        {/* Meta row */}
        <div className="mt-2 flex items-center gap-3 text-xs text-slate-600">
          {typeof beds === "number" && beds > 0 && (
            <span className="inline-flex items-center gap-1">
              <Bed className="h-3.5 w-3.5" aria-hidden="true" /> {beds} Bed{beds > 1 ? "s" : ""}
            </span>
          )}
          {typeof baths === "number" && baths > 0 && (
            <span className="inline-flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" aria-hidden="true" /> {baths} Bath{baths > 1 ? "s" : ""}
            </span>
          )}
          {typeof area === "number" && area > 0 && (
            <span className="inline-flex items-center gap-1">
              <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" /> {area} m²
            </span>
          )}
        </div>

        {/* CTA */}
        <span className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-blue-600 px-3 py-2 text-xs font-semibold text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white sm:text-sm">
          Request Viewing
        </span>
      </div>
    </Link>
  );
}
