"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_LINKS = [
  { href: "/cars", label: "Browse Cars" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/dashboard/owner/listings/new", label: "List Your Car" },
  { href: "/safety", label: "Safety" },
  { href: "/#help", label: "Help" },
] as const;

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "am", label: "አማ" },
] as const;

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<string>("en");

  const currentLangLabel =
    LANGUAGES.find((l) => l.code === currentLang)?.label ?? "EN";

  return (
    <header className="mp-header" id="site-header">
      <div className="mp-header__inner">
        {/* Logo */}
        <Link href="/" className="mp-header__logo" id="site-logo">
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            aria-hidden="true"
            className="mp-header__logo-icon"
          >
            <circle cx="14" cy="14" r="14" fill="#1A6DFF" />
            <path
              d="M8 19V10.5L11.5 7H16.5L20 10.5V19H16V14.5H12V19H8Z"
              fill="white"
            />
          </svg>
          <span className="mp-header__logo-text">
            MyProperties
            <span className="mp-header__tagline">
              Rent with trust. Drive with confidence.
            </span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="mp-header__nav" id="desktop-nav" aria-label="Main navigation">
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
          {/* Language selector */}
          <div className="mp-header__lang" id="lang-selector">
            <button
              className="mp-header__lang-btn"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              aria-expanded={langMenuOpen}
              aria-haspopup="listbox"
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                <ellipse cx="8" cy="8" rx="3.5" ry="7" stroke="currentColor" strokeWidth="1.5" />
                <line x1="1" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <span>{currentLangLabel}</span>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true" className="mp-header__chevron">
                <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {langMenuOpen && (
              <ul className="mp-header__lang-menu" role="listbox">
                {LANGUAGES.map((lang) => (
                  <li key={lang.code} role="option" aria-selected={currentLang === lang.code}>
                    <button
                      className={`mp-header__lang-option ${currentLang === lang.code ? "mp-header__lang-option--active" : ""}`}
                      onClick={() => {
                        setCurrentLang(lang.code);
                        setLangMenuOpen(false);
                      }}
                      type="button"
                    >
                      {lang.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Auth buttons */}
          <Link href="/login" className="mp-header__login" id="login-btn">
            Login
          </Link>
          <Link href="/signup" className="mp-header__register" id="register-btn">
            Register
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        <div className="mp-header__mobile" id="mobile-menu" role="dialog" aria-label="Mobile navigation">
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
