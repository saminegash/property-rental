import { ShieldCheck, BadgeCheck, Lock, Percent } from "lucide-react";

const ITEMS = [
  { icon: ShieldCheck, label: "Admin Reviewed Listings" },
  { icon: BadgeCheck, label: "Verified Owners & Sellers" },
  { icon: Lock, label: "Safe & Transparent Process" },
  { icon: Percent, label: "1-5% Commission After Successful Deal" },
] as const;

/**
 * Thin trust bar that sits above the header.
 * Mobile: horizontally scrollable, no scrollbar visible.
 * Desktop: evenly spaced, centered.
 */
export default function AnnouncementBar() {
  return (
    <div className="bg-blue-700 text-white text-xs sm:text-sm">
      <div className="mx-auto px-4">
        <ul
          className="flex items-center gap-6 overflow-x-auto py-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:justify-center md:gap-10"
          aria-label="Platform trust highlights"
        >
          {ITEMS.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex shrink-0 items-center gap-2 whitespace-nowrap"
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="font-medium">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
