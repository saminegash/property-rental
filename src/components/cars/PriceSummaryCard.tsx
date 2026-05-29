"use client";

import React from "react";
// TODO: Re-import when car detail routes are rebuilt
// import RentalRequestForm from "@/app/(public)/cars/[id]/RentalRequestForm";
// import CarSaleInquiryForm from "@/app/(public)/cars/[id]/CarSaleInquiryForm";

interface PriceSummaryCardProps {
  listingId: string;
  listingType?: "rent" | "sale";
  dailyPrice?: number | null;
  weeklyPrice?: number | null;
  monthlyPrice?: number | null;
  availableWithDriver: boolean;
  dailyDriverFee?: number | null;
  securityDeposit?: number | null;
  deliveryAvailable: boolean;
  deliveryFee?: number | null;
}

export function PriceSummaryCard({
  listingType = "rent",
  dailyPrice,
  weeklyPrice,
  monthlyPrice,
  availableWithDriver,
  dailyDriverFee,
  securityDeposit,
  deliveryAvailable,
  deliveryFee,
}: PriceSummaryCardProps) {
  return (
    <div
      className="detail-price-card"
      style={{
        padding: "1.5rem",
        backgroundColor: "#fff",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        position: "sticky",
        top: "2rem",
      }}
    >
      {/* Price */}
      <div
        className="detail-price-hero"
        style={{
          marginBottom: "1.5rem",
          paddingBottom: "1.5rem",
          borderBottom: "1px solid var(--color-border-light)",
        }}
      >
        {listingType === "rent" ? (
          dailyPrice ? (
            <div>
              <span
                style={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: "var(--color-primary)",
                }}
              >
                {dailyPrice.toLocaleString()}
              </span>
              <span
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 600,
                  color: "var(--color-text-heading)",
                }}
              >
                {" "}
                Birr
              </span>
              <span
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-text-muted)",
                }}
              >
                {" "}
                / day
              </span>
            </div>
          ) : (
            <span
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--color-text-heading)",
              }}
            >
              Contact for price
            </span>
          )
        ) : (
          <span
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "var(--color-text-heading)",
            }}
          >
            Contact for sale price
          </span>
        )}
      </div>

      {/* Breakdown (Only for Rent) */}
      {listingType === "rent" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          {(weeklyPrice || monthlyPrice) && (
            <div>
              <div
                style={{
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: "var(--color-text-muted)",
                  marginBottom: "0.5rem",
                }}
              >
                Long term discounts
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.375rem",
                  fontSize: "0.875rem",
                }}
              >
                {weeklyPrice && (
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ color: "var(--color-text-muted)" }}>
                      Weekly
                    </span>
                    <span style={{ fontWeight: 600 }}>
                      {weeklyPrice.toLocaleString()} Birr
                    </span>
                  </div>
                )}
                {monthlyPrice && (
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span style={{ color: "var(--color-text-muted)" }}>
                      Monthly
                    </span>
                    <span style={{ fontWeight: 600 }}>
                      {monthlyPrice.toLocaleString()} Birr
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {availableWithDriver && dailyDriverFee && (
            <div>
              <div
                style={{
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: "var(--color-text-muted)",
                  marginBottom: "0.5rem",
                }}
              >
                Driver Fee (Optional)
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.875rem",
                }}
              >
                <span style={{ color: "var(--color-text-muted)" }}>Daily</span>
                <span style={{ fontWeight: 600 }}>
                  {dailyDriverFee.toLocaleString()} Birr
                </span>
              </div>
            </div>
          )}

          {securityDeposit && securityDeposit > 0 ? (
            <div>
              <div
                style={{
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: "var(--color-text-muted)",
                  marginBottom: "0.5rem",
                }}
              >
                Security Deposit
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.875rem",
                }}
              >
                <span style={{ color: "var(--color-text-muted)" }}>
                  Refundable
                </span>
                <span style={{ fontWeight: 600 }}>
                  {securityDeposit.toLocaleString()} Birr
                </span>
              </div>
            </div>
          ) : null}

          {deliveryAvailable && deliveryFee && (
            <div>
              <div
                style={{
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: "var(--color-text-muted)",
                  marginBottom: "0.5rem",
                }}
              >
                Delivery
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.875rem",
                }}
              >
                <span style={{ color: "var(--color-text-muted)" }}>Fee</span>
                <span style={{ fontWeight: 600 }}>
                  {deliveryFee.toLocaleString()} Birr
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {listingType === "rent" && (
        <div
          style={{
            padding: "0.75rem",
            backgroundColor: "var(--color-surface-hover)",
            borderRadius: "var(--radius-md)",
            fontSize: "0.75rem",
            color: "var(--color-text-muted)",
            marginBottom: "1.5rem",
            textAlign: "center",
          }}
        >
          <strong>Note:</strong> A 5% platform commission applies to the base
          rental price only.
        </div>
      )}

      {/* CTA Form — placeholder until car detail routes are rebuilt */}
      <div
        style={{
          padding: "1rem",
          textAlign: "center",
          color: "var(--color-text-muted)",
          fontSize: "0.875rem",
        }}
      >
        Contact form coming soon
      </div>
    </div>
  );
}
