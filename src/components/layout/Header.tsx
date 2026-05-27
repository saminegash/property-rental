"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Plus } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/properties?type=sale", label: "Buy Property" },
  { href: "/properties?type=rent", label: "Rent Property" },
  { href: "/dashboard/become-owner", label: "Sell Property" },
  { href: "/cars", label: "Cars" },
  { href: "/dashboard/become-owner", label: "List Your Property" },
  { href: "/dashboard/become-owner?category=car", label: "Sell Your Car" },
  { href: "/safety", label: "Safety" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Image
              src="/logo.webp"
              alt="MyEthioProperties"
              width={40}
              height={40}
              className="h-9 w-auto object-contain lg:h-10"
              priority
            />
            <span className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
              MyEthio<span className="text-blue-600">Properties</span>
            </span>
          </Link>

          {/* Desktop nav — visible at xl and up because 10 items is a lot */}
          <nav
            aria-label="Primary"
            className="hidden xl:flex flex-1 items-center justify-center gap-1"
          >
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`px-2.5 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "text-blue-600"
                      : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="hidden md:inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Sign Up
            </Link>
            <Link
              href="/dashboard/become-owner"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Post Listing
            </Link>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 xl:hidden"
            >
              {open ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          id="mobile-menu"
          className="xl:hidden border-t border-slate-200 bg-white max-h-[calc(100vh-4rem)] overflow-y-auto"
        >
          <nav
            aria-label="Mobile"
            className="mx-auto max-w-7xl px-4 py-3 flex flex-col"
          >
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`rounded-lg px-3 py-3 text-base font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {/* Auth + Post on mobile */}
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-200 pt-3 sm:hidden">
              <Link
                href="/login"
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-center text-sm font-medium text-slate-700"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-center text-sm font-medium text-slate-700"
              >
                Sign Up
              </Link>
              <Link
                href="/dashboard/become-owner"
                className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Post Listing
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
