"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CarListingCard, CarListingCardProps } from "@/components/cars/CarListingCard";
import { PropertyListingCard, PropertyListingCardProps } from "@/components/properties/PropertyListingCard";

type MarketplaceHeroClientProps = {
  featuredCar: CarListingCardProps | null;
  featuredProperty: PropertyListingCardProps | null;
  propertyTypes: { id: string; name: string }[];
};

export function MarketplaceHeroClient({
  featuredCar,
  featuredProperty,
  propertyTypes,
}: MarketplaceHeroClientProps) {
  const [activeTab, setActiveTab] = useState<"cars" | "properties">("properties");
  const router = useRouter();

  function handleCarSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchParams = new URLSearchParams();

    const location = formData.get("location") as string;
    if (location) searchParams.set("location", location);

    const listingType = formData.get("listing_type") as string;
    if (listingType) searchParams.set("listing_type", listingType);

    const driver = formData.get("driver") as string;
    if (driver && listingType !== "sale") searchParams.set("driver", driver);

    router.push(`/cars?${searchParams.toString()}`);
  }

  function handlePropertySearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchParams = new URLSearchParams();

    const location = formData.get("location") as string;
    if (location) searchParams.set("location", location);

    const listingType = formData.get("listing_type") as string;
    if (listingType) searchParams.set("type", listingType);

    const propertyType = formData.get("property_type") as string;
    if (propertyType) searchParams.set("property_type", propertyType);

    const bedrooms = formData.get("bedrooms") as string;
    if (bedrooms) searchParams.set("min_beds", bedrooms);

    const budget = formData.get("budget") as string;
    if (budget) searchParams.set("max_price", budget);

    router.push(`/properties?${searchParams.toString()}`);
  }

  return (
    <section className="marketplace-hero" id="marketplace-hero">
      <div className="marketplace-hero__grid">
        
        <div className="marketplace-hero__content">
          <h1 className="marketplace-hero__headline">
            Find your next home with{" "}
            <span className="marketplace-hero__highlight">confidence</span>
          </h1>
          <p className="marketplace-hero__subtext">
            Verified properties for rent & sale. Admin-reviewed listings. Trusted deals.
          </p>

          <div className="hero-search-card">
            <div className="hero-search-tabs">
              <button
                className={`hero-search-tab ${activeTab === "properties" ? "hero-search-tab--active" : ""}`}
                onClick={() => setActiveTab("properties")}
              >
                🏠 Rent / Buy Properties
              </button>
              <button
                className={`hero-search-tab ${activeTab === "cars" ? "hero-search-tab--active" : ""}`}
                onClick={() => setActiveTab("cars")}
              >
                🚗 Rent / Buy Cars
              </button>
            </div>

            {activeTab === "cars" ? (
              <form className="hero-search-form" onSubmit={handleCarSearch}>
                <div className="hero-search-row">
                  <div>
                    <label className="form-label" style={{ fontSize: "0.75rem", marginBottom: "0.25rem" }}>Location</label>
                    <input type="text" name="location" className="form-input" placeholder="City or Neighborhood" />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: "0.75rem", marginBottom: "0.25rem" }}>I want to</label>
                    <select name="listing_type" className="form-input">
                      <option value="rent">Rent</option>
                      <option value="sale">Buy</option>
                    </select>
                  </div>
                </div>
                
                <div className="hero-search-row">
                  <div>
                    <label className="form-label" style={{ fontSize: "0.75rem", marginBottom: "0.25rem" }}>Start Date</label>
                    <input type="date" name="start_date" className="form-input" />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: "0.75rem", marginBottom: "0.25rem" }}>End Date</label>
                    <input type="date" name="end_date" className="form-input" />
                  </div>
                </div>

                <div className="hero-search-row">
                  <div>
                    <label className="form-label" style={{ fontSize: "0.75rem", marginBottom: "0.25rem" }}>Driver Option (Rentals)</label>
                    <select name="driver" className="form-input">
                      <option value="">Any</option>
                      <option value="with">With Driver</option>
                      <option value="without">Without Driver</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="auth-button" style={{ marginTop: "0.5rem" }}>
                  🔍 Search Cars
                </button>
              </form>
            ) : (
              <form className="hero-search-form" onSubmit={handlePropertySearch}>
                <div className="hero-search-row">
                  <div>
                    <label className="form-label" style={{ fontSize: "0.75rem", marginBottom: "0.25rem" }}>Location</label>
                    <input type="text" name="location" className="form-input" placeholder="City or Area" />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: "0.75rem", marginBottom: "0.25rem" }}>I want to</label>
                    <select name="listing_type" className="form-input">
                      <option value="rent">Rent</option>
                      <option value="sale">Buy</option>
                    </select>
                  </div>
                </div>
                
                <div className="hero-search-row">
                  <div>
                    <label className="form-label" style={{ fontSize: "0.75rem", marginBottom: "0.25rem" }}>Property Type</label>
                    <select name="property_type" className="form-input">
                      <option value="">Any Type</option>
                      {propertyTypes.map((pt) => (
                        <option key={pt.id} value={pt.name.toLowerCase()}>{pt.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: "0.75rem", marginBottom: "0.25rem" }}>Bedrooms</label>
                    <select name="bedrooms" className="form-input">
                      <option value="">Any</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                      <option value="5">5+</option>
                    </select>
                  </div>
                </div>

                <div className="hero-search-row">
                  <div>
                    <label className="form-label" style={{ fontSize: "0.75rem", marginBottom: "0.25rem" }}>Max Budget (ETB)</label>
                    <input type="number" name="budget" className="form-input" placeholder="e.g. 50000" />
                  </div>
                </div>

                <button type="submit" className="auth-button" style={{ marginTop: "0.5rem" }}>
                  🔍 Search Properties
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="marketplace-hero__visual">
          {activeTab === "cars" ? (
            featuredCar ? (
              <div style={{ width: "100%", maxWidth: "400px" }}>
                <CarListingCard {...featuredCar} />
              </div>
            ) : (
              <div className="dashboard-card" style={{ padding: "3rem 2rem", textAlign: "center", width: "100%", maxWidth: "400px" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🚙</div>
                <h3 className="dashboard-title" style={{ fontSize: "1.25rem" }}>Cars arriving soon</h3>
                <p className="dashboard-hint">Our marketplace is preparing top-tier vehicles for you.</p>
              </div>
            )
          ) : (
            featuredProperty ? (
              <div style={{ width: "100%", maxWidth: "400px" }}>
                <PropertyListingCard {...featuredProperty} />
              </div>
            ) : (
              <div className="dashboard-card" style={{ padding: "3rem 2rem", textAlign: "center", width: "100%", maxWidth: "400px" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏢</div>
                <h3 className="dashboard-title" style={{ fontSize: "1.25rem" }}>Properties arriving soon</h3>
                <p className="dashboard-hint">Our marketplace is preparing premium properties for you.</p>
              </div>
            )
          )}
        </div>

      </div>
    </section>
  );
}
