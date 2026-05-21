"use client";

import { useState } from "react";
import { submitForReview } from "../../../cars/[id]/edit/actions";
import Link from "next/link";

type Props = {
  listingId: string;
  listingStatus: string;
  hasPropertyDetails: boolean;
  hasPricing: boolean;
  imageCount: number;
  rejectionReason?: string | null;
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "status-badge--draft" },
  pending_review: { label: "Pending Review", className: "status-badge--pending" },
  published: { label: "Published", className: "status-badge--published" },
  rejected: { label: "Rejected", className: "status-badge--rejected" },
  archived: { label: "Archived", className: "status-badge--draft" },
  suspended: { label: "Suspended", className: "status-badge--rejected" },
};

export default function PropertySubmitReviewPanel({
  listingId,
  listingStatus,
  hasPropertyDetails,
  hasPricing,
  imageCount,
  rejectionReason,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [missingItems, setMissingItems] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(listingStatus);

  const isDraft = status === "draft";
  const isRejected = status === "rejected";
  const statusInfo = STATUS_LABELS[status] || {
    label: status,
    className: "status-badge--draft",
  };

  // Pre-flight checklist for the UI
  const checks = [
    { label: "Property details", done: hasPropertyDetails },
    { label: "Pricing information", done: hasPricing },
    { label: `At least 5 photos (${imageCount}/5)`, done: imageCount >= 5 },
  ];

  const allChecksPassed = checks.every((c) => c.done);

  async function handleSubmit() {
    setError(null);
    setMissingItems([]);
    setSuccess(false);
    setLoading(true);

    const result = await submitForReview(listingId);

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

      {(isDraft || isRejected) && (
        <>
          {isRejected && rejectionReason && (
            <div className="auth-error" style={{ marginBottom: "1.5rem" }}>
              <strong>Reason for rejection:</strong> {rejectionReason}
            </div>
          )}

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

          {error && (
            <div className="auth-error" style={{ marginBottom: "1.5rem" }}>
              <p style={{ margin: 0, fontWeight: 600 }}>Submission failed</p>
              <p style={{ margin: "0.25rem 0 0" }}>{error}</p>
              {missingItems.length > 0 && (
                <ul
                  style={{
                    margin: "0.5rem 0 0",
                    paddingLeft: "1.25rem",
                    fontSize: "0.875rem",
                  }}
                >
                  {missingItems.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {success && (
            <div
              style={{
                padding: "1rem",
                backgroundColor: "var(--color-success-bg)",
                border: "1px solid var(--color-success-border)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-success-text)",
                marginBottom: "1.5rem",
              }}
            >
              <p style={{ margin: 0, fontWeight: 500 }}>
                Successfully submitted for review!
              </p>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.875rem" }}>
                Our team will notify you once it&apos;s approved.
              </p>
            </div>
          )}

          {!success && (
            <button
              onClick={handleSubmit}
              className="auth-button"
              style={{ width: "100%" }}
              disabled={!allChecksPassed || loading}
            >
              {loading
                ? "Submitting..."
                : allChecksPassed
                ? isRejected ? "Resubmit for Review" : "Submit for Review"
                : "Complete all steps to submit"}
            </button>
          )}
        </>
      )}

      {!isDraft && !isRejected && !success && (
        <div style={{ textAlign: "center", padding: "2rem 0" }}>
          <p className="dashboard-hint" style={{ marginBottom: "1rem" }}>
            Your listing is currently {statusInfo.label.toLowerCase()}. You
            cannot edit it while it is under review or published.
          </p>
          <Link
            href="/dashboard/owner"
            className="auth-button auth-button--secondary"
          >
            Back to Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
