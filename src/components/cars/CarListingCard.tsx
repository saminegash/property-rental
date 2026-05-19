import Link from "next/link";
import React from "react";

export interface CarListingCardProps {
  id: string;
  title: string;
  location: string;
  image: string;
  dailyPrice: number | null;
  driverFee: number;
  securityDeposit: number;
  deliveryAvailable: boolean;
  withDriver: boolean;
  withoutDriver: boolean;
  rating?: number;
  reviewCount?: number;
  isVerifiedOwner?: boolean;
  isFeatured?: boolean;
  href: string;
}

export function CarListingCard({
  title,
  location,
  image,
  dailyPrice,
  driverFee,
  securityDeposit,
  deliveryAvailable,
  withDriver,
  withoutDriver,
  rating = 4.9,
  reviewCount = 24,
  href,
}: CarListingCardProps) {
  return (
    <div className="snap-start flex-none w-[280px] sm:w-[320px] lg:w-auto bg-white rounded-2xl shadow-(--shadow-card) border border-(--color-border) overflow-hidden flex flex-col hover:-translate-y-1 transition-transform duration-300">
      <div className="relative aspect-4/3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={title} className="w-full h-full object-cover" />
        
        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {withDriver && (
            <div className="bg-(--color-primary) text-white text-[0.625rem] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm w-fit">
              With Driver
            </div>
          )}
          {withoutDriver && !withDriver && (
            <div className="bg-[#6B7280] text-white text-[0.625rem] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm w-fit">
              Without Driver
            </div>
          )}
          {deliveryAvailable && (
            <div className="bg-(--color-success) text-white text-[0.625rem] font-bold uppercase tracking-wider px-2 py-1 rounded-md shadow-sm w-fit">
              Delivery
            </div>
          )}
        </div>

        {/* Favorite Icon */}
        <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-(--color-text-muted) hover:text-(--color-error) transition-colors shadow-sm z-10" aria-label="Save to favorites">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        </button>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-[1rem] text-(--color-text-heading) leading-tight mb-1 truncate">
          {title}
        </h3>
        <p className="text-[0.8125rem] text-(--color-text-muted) flex items-center gap-1 mb-4 truncate">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          {location}
        </p>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-(--color-primary-surface) text-[1.125rem]">
            🚗
          </div>
          <div>
            <div className="text-[0.6875rem] font-semibold text-(--color-text-muted) uppercase tracking-wider">Base Price</div>
            <div className="font-bold text-(--color-text-heading) leading-none mt-0.5">{dailyPrice ? `${dailyPrice.toLocaleString()} ETB/day` : "Contact for price"}</div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 border-t border-(--color-border-light) pt-3 mb-4">
          <div className="flex justify-between items-center text-[0.75rem]">
            <span className="text-(--color-text-muted)">Driver fee</span>
            <span className="font-medium text-(--color-text-heading)">
              {driverFee > 0 ? `+${driverFee.toLocaleString()}/day` : "Included"}
            </span>
          </div>
          <div className="flex justify-between items-center text-[0.75rem]">
            <span className="text-(--color-text-muted)">Deposit</span>
            <span className="font-medium text-(--color-text-heading)">{securityDeposit > 0 ? `${securityDeposit.toLocaleString()}` : "0"}</span>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-(--color-border-light) flex justify-between items-center">
          <div className="flex items-center gap-1 text-(--color-warning)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            <span className="text-[0.8125rem] font-bold text-(--color-text-heading) ml-0.5">{rating} <span className="text-(--color-text-muted) font-normal">({reviewCount})</span></span>
          </div>
          <Link href={href} className="text-[0.8125rem] font-bold text-(--color-primary) hover:text-(--color-primary-hover) transition-colors">
            Request Now →
          </Link>
        </div>
      </div>
    </div>
  );
}
