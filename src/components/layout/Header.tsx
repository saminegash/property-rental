"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/properties", label: "Browse Properties" },
  { href: "/cars", label: "Browse Cars" },
  { href: "/dashboard/become-owner", label: "List with Us" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/safety", label: "Safety" },
] as const;

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="mp-header" id="site-header">
      <div className="mp-header__inner">
        {/* Logo */}
        <Link href="/" className="mp-header__logo" id="site-logo">
          <Image
            src="/logo.webp"
            alt="MyEthioProperties Logo"
            width={80}
            height={80}
            className="mp-header__logo-image"
            style={{ height: "80px", width: "auto", objectFit: "contain" }}
          />
          <span className="mp-header__logo-text">
            MyEthioProperties
            <span className="mp-header__tagline">
              Rent, Buy and Sell with trust.
            </span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav
          className="mp-header__nav"
          id="desktop-nav"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`mp-header__link ${
                pathname === link.href ? "mp-header__link--active" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="mp-header__actions">
          {/* Dashboard & List Car CTAs */}
          <Link
            href="/dashboard"
            className="text-text-heading hover:text-primary p-2 hidden sm:block font-medium text-sm"
            aria-label="My Dashboard"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/become-owner"
            className="bg-primary hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-xl transition-colors shadow-sm whitespace-nowrap hidden lg:flex items-center gap-1 text-[0.875rem]"
          >
            List Now{" "}
            <span className="text-[1.125rem] leading-none font-normal">+</span>
          </Link>

          {/* Mobile hamburger */}
          <button
            className="mp-header__hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            type="button"
            id="hamburger-btn"
          >
            {mobileMenuOpen ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          className="mp-header__mobile"
          id="mobile-menu"
          role="dialog"
          aria-label="Mobile navigation"
        >
          <nav className="mp-header__mobile-nav" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`mp-header__mobile-link ${
                  pathname === link.href ? "mp-header__mobile-link--active" : ""
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mp-header__mobile-actions">
            <Link
              href="/login"
              className="mp-header__mobile-login"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="mp-header__mobile-register"
              onClick={() => setMobileMenuOpen(false)}
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
