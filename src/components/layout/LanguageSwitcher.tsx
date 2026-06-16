"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

const LOCALE_OPTIONS = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "am", label: "አማርኛ", flag: "🇪🇹" },
  { code: "om", label: "Oromoo", flag: "🇪🇹" },
] as const;

export default function LanguageSwitcher({
  currentLocale,
}: {
  currentLocale: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LOCALE_OPTIONS.find((o) => o.code === currentLocale) ?? LOCALE_OPTIONS[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function switchTo(locale: string) {
    const newPath = pathname.replace(`/${currentLocale}`, `/${locale}`);
    document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000`;
    setOpen(false);
    router.push(newPath);
  }

  return (
    <div ref={ref} className="lang-switcher-dropdown">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="lang-switcher"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Language: ${current.label}`}
      >
        <span className="lang-switcher__flag">{current.flag}</span>
        <span className="lang-switcher__label">{current.code.toUpperCase()}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Select language"
          className="lang-switcher-dropdown__menu"
        >
          {LOCALE_OPTIONS.map((option) => (
            <li key={option.code}>
              <button
                type="button"
                role="option"
                aria-selected={option.code === currentLocale}
                onClick={() => switchTo(option.code)}
                className={`lang-switcher-dropdown__option ${
                  option.code === currentLocale
                    ? "lang-switcher-dropdown__option--active"
                    : ""
                }`}
              >
                <span>{option.flag}</span>
                <span>{option.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
