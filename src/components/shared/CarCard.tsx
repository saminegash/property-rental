import Link from "next/link";
import Image from "next/image";
import { MapPin, Gauge, Settings2, BadgeCheck } from "lucide-react";

export type CarCardProps = {
  id: string;
  title: string;
  location: string;
  image: string;
  price: number;
  /** Listing type. Affects price suffix. */
  type?: "rent" | "sale";
  mileage?: number; // km
  transmission?: string;
  isVerified?: boolean;
  href?: string;
};

export function CarCard({
  id,
  title,
  location,
  image,
  price,
  type = "sale",
  mileage,
  transmission,
  isVerified,
  href,
}: CarCardProps) {
  const displayHref = href || `/cars/${id}`;
  const isRent = type === "rent";

  return (
    <Link
      href={displayHref}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <Image
          src={image || "/placeholder-car.jpg"}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {isRent && (
          <span className="absolute left-3 top-3 inline-flex items-center rounded-md bg-blue-600 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm">
            For Rent
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="line-clamp-1 text-sm font-semibold text-slate-900 sm:text-base">
          {title}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
          <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span className="truncate">{location}</span>
        </p>

        <p className="mt-2 text-base font-bold text-blue-600 sm:text-lg">
          ETB {price.toLocaleString()}
          {isRent && <span className="text-xs font-medium text-slate-500"> / day</span>}
        </p>

        <div className="mt-2 flex items-center gap-3 text-xs text-slate-600">
          {typeof mileage === "number" && mileage > 0 && (
            <span className="inline-flex items-center gap-1">
              <Gauge className="h-3.5 w-3.5" aria-hidden="true" />
              {mileage.toLocaleString()} km
            </span>
          )}
          {transmission && (
            <span className="inline-flex items-center gap-1">
              <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
              {transmission}
            </span>
          )}
        </div>

        {isVerified && (
          <div className="mt-3 inline-flex w-fit items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">
            <BadgeCheck className="h-3 w-3" aria-hidden="true" />
            Verified Seller
          </div>
        )}

        <span className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 group-hover:border-blue-600 group-hover:text-blue-600 transition-colors">
          View Details
        </span>
      </div>
    </Link>
  );
}
