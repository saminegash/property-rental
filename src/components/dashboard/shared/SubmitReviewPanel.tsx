"use client";

import { useState } from "react";
import Link from "next/link";

type Props = {
  listingId: string;
  listingStatus: string;
  hasVehicleDetails?: boolean;
  hasPropertyDetails?: boolean;
  hasPricing: boolean;
  hasRentalTerms?: boolean;
  imageCount: number;
  backHref: string;
  category: "vehicle" | "property";
  onSubmit: () => Promise<{ error?: string; missing?: string[]; success?: boolean }>;
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "status-badge--draft" },
  pending_review: { label: "Pending Review", className: "status-badge--pending" },
  published: { label: "Published", className: "status-badge--published" },
  rejected: { label: "Rejected", className: "status-badge--rejected" },
  archived: { label: "Archived", className: "status-badge--draft" },
  suspended: { label: "Suspended", className: "status-badge--rejected" },
};

export default function SubmitReviewPanel({
  listingId,
  listingStatus,
  hasVehicleDetails,
  hasPropertyDetails,
  hasPricing,
  hasRentalTerms,
  imageCount,
  backHref,
  category,
  onSubmit,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [missingItems, setMissingItems] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(listingStatus);

  const isDraft = status === "draft";
  const statusInfo = STATUS_LABELS[status] || {
    label: status,
    className: "status-badge--draft",
  };

  // Pre-flight checklist for the UI
  const checks = [];
  if (category === "vehicle") {
    checks.push({ label: "Vehicle details", done: !!hasVehicleDetails });
    checks.push({ label: "Rental pricing (daily rate)", done: hasPricing });
    checks.push({ label: "Driver & rental options", done: !!hasRentalTerms });
  } else {
    checks.push({ label: "Property details", done: !!hasPropertyDetails });
    checks.push({ label: "Pricing / Terms", done: hasPricing });
  }
  checks.push({ label: `At least 5 photos (${imageCount}/5)`, done: imageCount >= 5 });

  const allChecksPassed = checks.every((c) => c.done);

  async function handleSubmit() {
    setError(null);
    setMissingItems([]);
    setSuccess(false);
    setLoading(true);

    const result = await onSubmit();

    if (result.error) {
      setError(result.error);
      if ("missing" in result && Array.isArray(result.missing)) {
        setMissingItems(result.missing);
      }
      setLoading(false);
    } else if (result.success) {
      setSuccess(true);
      setStatus("pending_review");
      setLoading(false);
    }
  }

  return (
    <div
      className="dashboard-card"
      style={{ maxWidth: "640px", margin: "2rem auto 0" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h2 className="dashboard-title" style={{ fontSize: "1.25rem", marginBottom: 0 }}>
          Submit for Review
        </h2>
        <span className={`status-badge ${statusInfo.className}`}>
          {statusInfo.label}
        </span>
      </div>

      {isDraft && (
        <>
          <p className="dashboard-hint" style={{ marginBottom: "1.5rem" }}>
            Before submitting, make sure all sections are complete. An admin
            will review your listing before it goes live.
          </p>

          {/* Checklist */}
          <div style={{ marginBottom: "1.5rem" }}>
            {checks.map((check) => (
              <div
                key={check.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  padding: "0.5rem 0",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <span
                  style={{
                    width: "1.25rem",
                    height: "1.25rem",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    flexShrink: 0,
                    backgroundColor: check.done
                      ? "var(--color-success-bg)"
                      : "var(--color-surface-hover)",
                    color: check.done
                      ? "var(--color-success-text)"
                      : "var(--color-text-muted)",
                    border: `1px solid ${
                      check.done
                        ? "var(--color-success-border)"
                        : "var(--color-border)"
                    }`,
                  }}
                >
                  {check.done ? "✓" : "–"}
                </span>
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: check.done
                      ? "var(--color-text)"
                      : "var(--color-text-muted)",
                  }}
                >
                  {check.label}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {error && (
        <div className="auth-error" role="alert" style={{ marginBottom: "1rem" }}>
          {error}
          {missingItems.length > 0 && (
            <ul
              style={{
                marginTop: "0.5rem",
                paddingLeft: "1.25rem",
                listStyle: "disc",
              }}
            >
              {missingItems.map((item) => (
                <li key={item} style={{ marginTop: "0.25rem" }}>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {success && (
        <div className="form-success" role="status" style={{ marginBottom: "1rem" }}>
          🎉 Your listing has been submitted for admin review! You&apos;ll be
          notified once it&apos;s approved.
        </div>
      )}

      {!isDraft && !success && (
        <p className="dashboard-hint" style={{ marginBottom: "1.5rem" }}>
          {status === "pending_review"
            ? "Your listing is currently being reviewed by an admin. You&apos;ll be notified once it&apos;s approved."
            : status === "published"
              ? "Your listing is live and visible to renters."
              : status === "rejected"
                ? "Your listing was not approved. Please review admin feedback and resubmit."
                : "This listing is not currently active."}
        </p>
      )}

      <div style={{ display: "flex", gap: "1rem" }}>
        <Link
          href={backHref}
          className="auth-button auth-button--secondary"
          style={{ flex: 1, textDecoration: "none", textAlign: "center" }}
        >
          ← Back
        </Link>

        {isDraft && (
          <button
            type="button"
            className="auth-button"
            style={{ flex: 1 }}
            disabled={loading || !allChecksPassed}
            onClick={handleSubmit}
          >
            {loading ? "Submitting..." : "Submit for Review"}
          </button>
        )}
      </div>
    </div>
  );
}
