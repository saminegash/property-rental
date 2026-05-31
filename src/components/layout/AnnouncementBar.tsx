import { ShieldCheck, BadgeCheck, Lock, Percent } from "lucide-react";
import { COMMISSION_COPY } from "@/lib/commission";

const ITEMS = [
  { icon: ShieldCheck, label: "Admin Reviewed Listings" },
  { icon: BadgeCheck, label: "Verified Owners & Sellers" },
  { icon: Lock, label: "Safe & Transparent Process" },
  {
    icon: Percent,
    label: `${COMMISSION_COPY.short} — Only After a Successful Deal`,
  },
] as const;

/**
 * Thin trust bar that sits above the header.
 * Scrolling horizontally non-stop like an LED display.
 */
export default function AnnouncementBar() {
  // Repeat items to ensure there's always enough content to fill wide screens during the scroll
  const REPEATED_ITEMS = [...ITEMS, ...ITEMS, ...ITEMS, ...ITEMS];

  return (
    <div className="bg-blue-700 text-white text-xs sm:text-sm overflow-hidden flex">
      {/* 
        The marquee wrapper contains two identical halves.
        It translates from 0 to -50% to create a seamless infinite loop.
      */}
      <div className="flex w-max animate-marquee hover:pause">
        {/* First half */}
        <ul
          className="flex items-center gap-6 py-2.5 pr-6 md:gap-10 md:pr-10"
          aria-label="Platform trust highlights"
        >
          {REPEATED_ITEMS.map(({ icon: Icon, label }, i) => (
            <li
              key={`orig-${i}`}
              className="flex shrink-0 items-center gap-2 whitespace-nowrap"
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="font-medium">{label}</span>
            </li>
          ))}
        </ul>

        {/* Second half (exact copy for seamless loop) */}
        <ul
          className="flex items-center gap-6 py-2.5 pr-6 md:gap-10 md:pr-10"
          aria-hidden="true"
        >
          {REPEATED_ITEMS.map(({ icon: Icon, label }, i) => (
            <li
              key={`copy-${i}`}
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
