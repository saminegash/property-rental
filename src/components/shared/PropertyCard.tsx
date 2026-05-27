import Link from "next/link";
import Image from "next/image";
import { MapPin, Bed, Bath, Maximize2, BadgeCheck } from "lucide-react";

export type PropertyCardProps = {
  id: string;
  title: string;
  location: string;
  image: string;
  price: number;
  /** "rent" or "sale" — shown as For Rent / For Sale badge */
  type: "rent" | "sale";
  beds?: number;
  baths?: number;
  area?: number; // sqm
  isVerified?: boolean;
  href?: string;
};

/**
 * Compact property card. Used in Featured Properties and search grids.
 * Fully responsive: scales image, stacks meta on small widths.
 */
export function PropertyCard({
  id,
  title,
  location,
  image,
  price,
  type,
  beds,
  baths,
  area,
  isVerified,
  href,
}: PropertyCardProps) {
  const displayHref = href || `/properties/${id}`;
  const isRent = type === "rent";

  return (
    <Link
      href={displayHref}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      {/* Image with badge */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <Image
          src={image || "/placeholder-property.jpg"}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
        />
        <span
          className={`absolute left-3 top-3 inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm ${
            isRent ? "bg-blue-600" : "bg-emerald-600"
          }`}
        >
          For {isRent ? "Rent" : "Sale"}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4 sm:p-4">
        <h3 className="line-clamp-1 text-sm font-semibold text-slate-900 sm:text-base">
          {title}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
          <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span className="truncate">{location}</span>
        </p>

        {/* Price */}
        {price > 0 ? (
          <p className="mt-2 text-base font-bold text-blue-600 sm:text-lg">
            ETB {price.toLocaleString()}
            {isRent && <span className="text-xs font-medium text-slate-500"> / month</span>}
          </p>
        ) : (
          <p className="mt-2 text-sm font-medium italic text-slate-500">Price on request</p>
        )}

        {/* Meta */}
        <div className="mt-2 flex items-center gap-3 text-xs text-slate-600">
          {typeof beds === "number" && beds > 0 && (
            <span className="inline-flex items-center gap-1">
              <Bed className="h-3.5 w-3.5" aria-hidden="true" /> {beds}
            </span>
          )}
          {typeof baths === "number" && baths > 0 && (
            <span className="inline-flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" aria-hidden="true" /> {baths}
            </span>
          )}
          {typeof area === "number" && area > 0 && (
            <span className="inline-flex items-center gap-1">
              <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" /> {area} m²
            </span>
          )}
        </div>

        {/* Verified */}
        {isVerified && (
          <div className="mt-3 inline-flex w-fit items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">
            <BadgeCheck className="h-3 w-3" aria-hidden="true" />
            Verified Owner
          </div>
        )}

        {/* CTA */}
        <span className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 group-hover:border-blue-600 group-hover:text-blue-600 transition-colors">
          View Details
        </span>
      </div>
    </Link>
  );
}
