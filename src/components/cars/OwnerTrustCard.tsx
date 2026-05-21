import React from "react";

interface OwnerTrustCardProps {
  isVerified: boolean;
  ownerRating: string | number;
  ownerReviewCount: number;
  ownerType?: string;
  businessName?: string | null;
}

export function OwnerTrustCard({
  isVerified,
  ownerRating,
  ownerReviewCount,
  ownerType,
  businessName,
}: OwnerTrustCardProps) {
  return (
    <div className="detail-trust-card" style={{ padding: "1.5rem", backgroundColor: "#fff", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", marginBottom: "1.5rem" }}>
      <h3 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-text-heading)", marginBottom: "1rem" }}>
        Meet the Owner
      </h3>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--color-surface-hover)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem" }}>
            👤
          </div>
          <div>
            <div style={{ fontWeight: 600, color: "var(--color-text-heading)" }}>
              {ownerType === "rental_company" && businessName ? businessName : "Private Owner"}
            </div>
            <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
              {isVerified ? "Verified Identity" : "Identity unverified"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
          {isVerified && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontWeight: 600, padding: "0.25rem 0.5rem", backgroundColor: "var(--color-success)", color: "#fff", borderRadius: "var(--radius-full)" }}>
              ✓ Verified Platform Member
            </span>
          )}
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontWeight: 600, padding: "0.25rem 0.5rem", backgroundColor: "var(--color-surface-hover)", color: "var(--color-text-heading)", borderRadius: "var(--radius-full)" }}>
            ⭐ {ownerRating} ({ownerReviewCount} reviews)
          </span>
        </div>
      </div>
      
      <div style={{ marginTop: "1rem", padding: "0.75rem", backgroundColor: "var(--color-primary-light)", borderRadius: "var(--radius-md)", fontSize: "0.875rem", color: "var(--color-primary-dark)" }}>
        <strong>Safety Note:</strong> Always complete agreements and inspect vehicles in person before handing over keys or making direct payments to the owner.
      </div>
    </div>
  );
}
