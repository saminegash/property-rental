import Link from "next/link";
import React from "react";

interface PopularLocationsSectionProps {
  baseRoute?: string;
  subtitle?: string;
}

export function PopularLocationsSection({ 
  baseRoute = "/properties",
  subtitle = "Find the perfect property exactly where you need it."
}: PopularLocationsSectionProps = {}) {
  const locations = [
    "Addis Ababa",
    "Bole",
    "CMC",
    "Megenagna",
    "Kazanchis",
    "Ayat",
    "Sarbet",
    "Piassa"
  ];

  return (
    <section className="popular-locations" id="popular-locations">
      <div className="popular-locations__inner">
        <div className="popular-locations__header">
          <h2 className="popular-locations__title">Popular Locations</h2>
          <p className="popular-locations__subtitle">{subtitle}</p>
        </div>

        <div className="popular-locations__grid">
          {locations.map((loc) => (
            <Link 
              key={loc} 
              href={`${baseRoute}?location=${encodeURIComponent(loc)}`}
              className="popular-location-chip"
            >
              <svg className="popular-location-chip__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span className="popular-location-chip__text">{loc}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
