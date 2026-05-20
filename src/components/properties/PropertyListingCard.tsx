import Link from "next/link";
import React from "react";

export interface PropertyListingCardProps {
  id: string;
  title: string;
  location: string;
  image: string;
  price: number;
  type: "rent" | "buy";
  beds: number;
  baths: number;
  area: number;
  isVerified?: boolean;
  isFeatured?: boolean;
  href: string;
}

export function PropertyListingCard({
  title,
  location,
  image,
  price,
  type,
  beds,
  baths,
  area,
  isVerified = true,
  isFeatured = false,
  href,
}: PropertyListingCardProps) {
  return (
    <div className="snap-start flex-none w-[280px] sm:w-[320px] lg:w-auto bg-white rounded-2xl shadow-card border border-border overflow-hidden flex flex-col hover:-translate-y-1 transition-transform duration-300">
      <div className="relative aspect-4/3 bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={title} className="w-full h-full object-cover" />
        
        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex gap-1.5 z-10">
          {isVerified && (
            <div className="bg-success text-white text-[0.625rem] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm w-fit">
              Verified
            </div>
          )}
          {isFeatured && (
            <div className="bg-primary text-white text-[0.625rem] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm w-fit">
              Featured
            </div>
          )}
        </div>

        {/* Favorite Icon */}
        <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-text-muted hover:text-error transition-colors shadow-sm z-10" aria-label="Save to favorites">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        </button>
        
        {/* Status Badge */}
        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white text-[0.6875rem] font-semibold px-2.5 py-1 rounded-lg z-10">
          For {type === "rent" ? "Rent" : "Sale"}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-[1rem] text-text-heading leading-tight mb-1 truncate">
          {title}
        </h3>
        <p className="text-[0.8125rem] text-text-muted flex items-center gap-1 mb-3 truncate">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          {location}
        </p>

        <div className="font-bold text-[1.125rem] text-primary mb-4">
          {price.toLocaleString()} ETB <span className="text-[0.8125rem] text-text-muted font-normal">{type === "rent" ? "/month" : ""}</span>
        </div>

        <div className="flex items-center gap-4 text-[0.8125rem] text-text-muted border-t border-border-light pt-4 mt-auto">
          <div className="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            <span>{beds} Beds</span>
          </div>
          <div className="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20"></path><path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8"></path><path d="M4 6v6"></path><path d="M20 6v6"></path><path d="M8 2h8"></path><path d="M12 2v4"></path></svg>
            <span>{baths} Baths</span>
          </div>
          <div className="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            <span>{area} m²</span>
          </div>
        </div>
      </div>
      <Link href={href} className="absolute inset-0" aria-label={`View details for ${title}`} />
    </div>
  );
}
