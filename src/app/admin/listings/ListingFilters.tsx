"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState } from "react";

export default function ListingFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") || "pending_review";
  const currentCategory = searchParams.get("category") || "all";
  const currentListingType = searchParams.get("listing_type") || "all";
  const currentReviewType = searchParams.get("review_type") || "all";
  const currentLocation = searchParams.get("location") || "";
  const currentOwner = searchParams.get("owner") || "";

  const [locationValue, setLocationValue] = useState(currentLocation);
  const [ownerValue, setOwnerValue] = useState(currentOwner);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (name: string, value: string) => {
    router.push(pathname + "?" + createQueryString(name, value));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchParams.toString();
    const params = new URLSearchParams(query);
    
    if (locationValue) params.set("location", locationValue);
    else params.delete("location");
    
    if (ownerValue) params.set("owner", ownerValue);
    else params.delete("owner");

    router.push(pathname + "?" + params.toString());
  };

  return (
    <div className="dashboard-card" style={{ marginBottom: "2rem" }}>
      <h2 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Filters</h2>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", fontWeight: 500 }}>Status</label>
          <select 
            value={currentStatus} 
            onChange={(e) => handleFilterChange("status", e.target.value)}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", backgroundColor: "var(--color-bg)" }}
          >
            <option value="all">All</option>
            <option value="pending_review">Pending Review</option>
            <option value="published">Published</option>
            <option value="rejected">Rejected</option>
            <option value="archived">Archived</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", fontWeight: 500 }}>Category</label>
          <select 
            value={currentCategory} 
            onChange={(e) => handleFilterChange("category", e.target.value)}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", backgroundColor: "var(--color-bg)" }}
          >
            <option value="all">All</option>
            <option value="vehicle">Vehicle</option>
            <option value="property">Property</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", fontWeight: 500 }}>Listing Type</label>
          <select 
            value={currentListingType} 
            onChange={(e) => handleFilterChange("listing_type", e.target.value)}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", backgroundColor: "var(--color-bg)" }}
          >
            <option value="all">All</option>
            <option value="rent">Rent</option>
            <option value="sale">Sale</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", fontWeight: 500 }}>Review Type</label>
          <select 
            value={currentReviewType} 
            onChange={(e) => handleFilterChange("review_type", e.target.value)}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", backgroundColor: "var(--color-bg)" }}
          >
            <option value="all">All</option>
            <option value="new_listing">New Listing</option>
            <option value="price_change">Price Change</option>
          </select>
        </div>
      </div>

      <form onSubmit={handleSearchSubmit} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", fontWeight: 500 }}>Owner (Name/Email)</label>
          <input 
            type="text" 
            placeholder="Search owners..." 
            value={ownerValue}
            onChange={(e) => setOwnerValue(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", backgroundColor: "var(--color-bg)" }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem", fontWeight: 500 }}>Location</label>
          <input 
            type="text" 
            placeholder="Search location..." 
            value={locationValue}
            onChange={(e) => setLocationValue(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)", backgroundColor: "var(--color-bg)" }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button type="submit" className="button button--primary" style={{ width: "100%", padding: "0.5rem" }}>
            Search
          </button>
        </div>
      </form>
    </div>
  );
}
