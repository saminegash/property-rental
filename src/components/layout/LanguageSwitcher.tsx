"use client";

import { usePathname, useRouter } from "next/navigation";

export default function LanguageSwitcher({
  currentLocale,
}: {
  currentLocale: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const otherLocale = currentLocale === "en" ? "am" : "en";
  const newPath = pathname.replace(`/${currentLocale}`, `/${otherLocale}`);

  const handleSwitch = () => {
    document.cookie = `NEXT_LOCALE=${otherLocale};path=/;max-age=31536000`;
    router.push(newPath);
  };

  return (
    <button
      type="button"
      onClick={handleSwitch}
      className="lang-switcher"
      aria-label={`Switch to ${otherLocale === "en" ? "English" : "Amharic"}`}
      title={otherLocale === "en" ? "Switch to English" : "ወደ አማርኛ ቀይር"}
    >
      <span className="lang-switcher__flag">
        {currentLocale === "en" ? "🇪🇹" : "🇬🇧"}
      </span>
      <span className="lang-switcher__label">
        {currentLocale === "en" ? "አማ" : "EN"}
      </span>
    </button>
  );
}
