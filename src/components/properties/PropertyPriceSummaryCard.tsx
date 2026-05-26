"use client";

import React from "react";
import PropertyRequestForm from "@/app/(public)/properties/[id]/PropertyRequestForm";

interface PropertyPriceSummaryCardProps {
  listingId: string;
  listingType: "rent" | "sale";
  dailyPrice?: number | null;
  monthlyPrice?: number | null;
  salePrice?: number | null;
  securityDeposit?: number | null;
  minimumRentalDays?: number | null;
}

export function PropertyPriceSummaryCard({
  listingId,
  listingType,
  dailyPrice,
  monthlyPrice,
  salePrice,
  securityDeposit,
  minimumRentalDays,
}: PropertyPriceSummaryCardProps) {
  return (
    <div className="detail-price-card" style={{ padding: "1.5rem", backgroundColor: "#fff", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", position: "sticky", top: "2rem" }}>
      {/* Price Area */}
      <div className="detail-price-hero" style={{ marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid var(--color-border-light)" }}>
        {listingType === "rent" ? (
          (monthlyPrice || dailyPrice) ? (
            <div>
              <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-primary)" }}>
                {monthlyPrice ? monthlyPrice.toLocaleString() : dailyPrice?.toLocaleString()}
              </span>
              <span style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--color-text-heading)" }}> ETB</span>
              <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}> /{monthlyPrice ? "month" : "day"}</span>
            </div>
          ) : (
            <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-heading)" }}>
              Contact for price
            </span>
          )
        ) : (
          salePrice ? (
            <div>
              <span style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-primary)" }}>
                {salePrice.toLocaleString()}
              </span>
              <span style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--color-text-heading)" }}> ETB</span>
            </div>
          ) : (
            <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-heading)" }}>
              Price on Request
            </span>
          )
        )}
      </div>

      {/* Breakdown for Rentals */}
      {listingType === "rent" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
          {dailyPrice && monthlyPrice && (
            <div>
              <div style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Short term rate</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                <span style={{ color: "var(--color-text-muted)" }}>Daily</span>
                <span style={{ fontWeight: 600 }}>{dailyPrice.toLocaleString()} ETB</span>
              </div>
            </div>
          )}

          {securityDeposit && securityDeposit > 0 ? (
            <div>
              <div style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Security Deposit</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                <span style={{ color: "var(--color-text-muted)" }}>Refundable</span>
                <span style={{ fontWeight: 600 }}>{securityDeposit.toLocaleString()} ETB</span>
              </div>
            </div>
          ) : null}

          {minimumRentalDays && minimumRentalDays > 1 && (
            <div>
              <div style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>Rental Period</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem" }}>
                <span style={{ color: "var(--color-text-muted)" }}>Minimum</span>
                <span style={{ fontWeight: 600 }}>{minimumRentalDays} days</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Commission Note */}
      <div style={{ padding: "0.75rem", backgroundColor: "var(--color-surface-hover)", borderRadius: "var(--radius-md)", fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "1.5rem", textAlign: "center" }}>
        <strong>Note:</strong> A small fixed commission applies to the base listing price.
      </div>

      {/* CTA Form */}
      <PropertyRequestForm
        listingId={listingId}
        type={listingType}
      />
    </div>
  );
}
