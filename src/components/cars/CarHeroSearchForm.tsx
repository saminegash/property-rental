"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CarHeroSearchForm() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [driverOption, setDriverOption] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (startDate) params.set("start", startDate);
    if (endDate) params.set("end", endDate);
    if (driverOption) params.set("driver", driverOption);
    router.push(`/cars?${params.toString()}`);
  }

  // Get tomorrow and day-after-tomorrow for date defaults
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 3);

  const formatDatePlaceholder = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <form onSubmit={handleSubmit} className="car-hero-search" id="car-hero-search-form">
      <div className="car-hero-search__fields">
        {/* Pickup Location */}
        <div className="car-hero-search__field">
          <label className="car-hero-search__label" htmlFor="hero-location">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Pick-up location
          </label>
          <input
            type="text"
            id="hero-location"
            name="location"
            placeholder="Addis Ababa, Ethiopia"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="car-hero-search__input"
          />
        </div>

        {/* Start Date */}
        <div className="car-hero-search__field">
          <label className="car-hero-search__label" htmlFor="hero-start-date">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Start date
          </label>
          <input
            type="date"
            id="hero-start-date"
            name="start"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="car-hero-search__input"
            placeholder={formatDatePlaceholder(tomorrow)}
            min={tomorrow.toISOString().split("T")[0]}
          />
        </div>

        {/* End Date */}
        <div className="car-hero-search__field">
          <label className="car-hero-search__label" htmlFor="hero-end-date">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            End date
          </label>
          <input
            type="date"
            id="hero-end-date"
            name="end"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="car-hero-search__input"
            placeholder={formatDatePlaceholder(dayAfter)}
            min={startDate || tomorrow.toISOString().split("T")[0]}
          />
        </div>

        {/* Driver Option */}
        <div className="car-hero-search__field">
          <label className="car-hero-search__label" htmlFor="hero-driver">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-2-2.2-3.3C13 5.6 12 5 10.8 5H5.6c-.8 0-1.5.5-1.8 1.2L2 11v5c0 .6.4 1 1 1h2" />
              <circle cx="7" cy="17" r="2" />
              <circle cx="17" cy="17" r="2" />
            </svg>
            Driver option
          </label>
          <select
            id="hero-driver"
            name="driver"
            value={driverOption}
            onChange={(e) => setDriverOption(e.target.value)}
            className="car-hero-search__select"
          >
            <option value="">Any option</option>
            <option value="with">With Driver</option>
            <option value="without">Without Driver</option>
          </select>
        </div>
      </div>

      {/* Search Button */}
      <button type="submit" className="car-hero-search__btn" id="car-hero-search-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        Search Cars
      </button>
    </form>
  );
}
