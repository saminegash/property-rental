"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  MapPin,
  Gauge,
  Settings2,
  Fuel,
  Users,
  UserCheck,
  UserX,
  Heart,
} from "lucide-react";

export type RentalCarCardProps = {
  id: string;
  title: string; // e.g. "Toyota Corolla 2020"
  location: string;
  image: string;
  dailyRate: number;
  mileage?: number; // km
  transmission?: string; // Automatic / Manual
  fuel?: string; // Petrol / Diesel
  seats?: number;
  driverIncluded?: boolean; // true=with driver, false=self-drive, undefined=both available
  isAvailableNow?: boolean;
  isVerified?: boolean;
  href?: string;
};

export function RentalCarCard({
  id,
  title,
  location,
  image,
  dailyRate,
  mileage,
  transmission,
  fuel,
  seats,
  driverIncluded,
  isAvailableNow = true,
  isVerified = false,
  href,
}: RentalCarCardProps) {
  const [saved, setSaved] = useState(false);
  const detailHref = href || `/cars/${id}`;

  function handleSave(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSaved((s) => !s);
    // TODO: hit /api/saved
  }

  return (
    <Link
      href={detailHref}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <Image
          src={image || "/placeholder-car.jpg"}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
        />

        {/* Available Now */}
        {isAvailableNow && (
          <span className="absolute left-3 top-3 inline-flex items-center rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
            Available Now
          </span>
        )}

        {/* Save */}
        <button
          type="button"
          onClick={handleSave}
          aria-label={saved ? "Remove from saved" : "Save car"}
          aria-pressed={saved}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 backdrop-blur shadow-sm hover:bg-white transition-colors"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              saved ? "fill-red-500 text-red-500" : "text-slate-600"
            }`}
            aria-hidden="true"
          />
        </button>

        {/* Verified pill */}
        {isVerified && (
          <span className="absolute bottom-3 left-3 inline-flex items-center rounded-md bg-emerald-700 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
            Verified
          </span>
        )}

        {/* Driver badge — top-right under heart on lower position */}
        {driverIncluded !== undefined && (
          <span
            className={`absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold shadow-sm ${
              driverIncluded
                ? "bg-blue-600 text-white"
                : "bg-amber-500 text-white"
            }`}
          >
            {driverIncluded ? (
              <>
                <UserCheck className="h-3 w-3" aria-hidden="true" />
                With Driver
              </>
            ) : (
              <>
                <UserX className="h-3 w-3" aria-hidden="true" />
                Self-Drive
              </>
            )}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {/* Price */}
        <p className="text-base font-bold text-emerald-600 sm:text-lg">
          ETB {dailyRate.toLocaleString()}
          <span className="text-xs font-medium text-slate-500"> / day</span>
        </p>

        {/* Title */}
        <h3 className="mt-2 line-clamp-1 text-sm font-semibold text-slate-900 sm:text-base">
          {title}
        </h3>

        {/* Location */}
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
          <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span className="truncate">{location}</span>
        </p>

        {/* Specs */}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
          {transmission && (
            <span className="inline-flex items-center gap-1">
              <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
              {transmission}
            </span>
          )}
          {fuel && (
            <span className="inline-flex items-center gap-1">
              <Fuel className="h-3.5 w-3.5" aria-hidden="true" />
              {fuel}
            </span>
          )}
          {typeof seats === "number" && seats > 0 && (
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              {seats}
            </span>
          )}
          {typeof mileage === "number" && mileage > 0 && (
            <span className="inline-flex items-center gap-1">
              <Gauge className="h-3.5 w-3.5" aria-hidden="true" />
              {(mileage / 1000).toFixed(0)}k km
            </span>
          )}
        </div>

        {/* CTA */}
        <span className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-emerald-600 px-3 py-2 text-xs font-semibold text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white sm:text-sm">
          Request Booking
        </span>
      </div>
    </Link>
  );
}
