import React from "react";
import { createClient } from "@/lib/supabase/server";
import VerificationForm from "./VerificationForm";

export const dynamic = "force-dynamic";

export default async function OwnerProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("owner_profiles")
      .select("verification_status")
      .eq("user_id", user.id)
      .single();
    profile = data;
  }

  const status = profile?.verification_status || "not_submitted";

  function renderStatus() {
    switch (status) {
      case "pending":
        return (
          <div style={{ backgroundColor: "#fffbeb", padding: "1.5rem", borderRadius: "var(--radius-md)", border: "1px solid #fde68a" }}>
            <h3 style={{ color: "#d97706", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>⏳</span> Verification Pending
            </h3>
            <p style={{ color: "#92400e", fontSize: "0.875rem", margin: 0 }}>
              Your verification request has been received. Our team is currently reviewing your details and will contact you shortly.
            </p>
          </div>
        );
      case "verified":
        return (
          <div style={{ backgroundColor: "#f0fdf4", padding: "1.5rem", borderRadius: "var(--radius-md)", border: "1px solid #bbf7d0" }}>
            <h3 style={{ color: "#16a34a", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>✅</span> Verified Owner
            </h3>
            <p style={{ color: "#166534", fontSize: "0.875rem", margin: 0 }}>
              Your identity and ownership details have been successfully verified. A trust badge is now displayed on all your listings.
            </p>
          </div>
        );
      case "suspended":
        return (
          <div style={{ backgroundColor: "#fef2f2", padding: "1.5rem", borderRadius: "var(--radius-md)", border: "1px solid #fecaca" }}>
            <h3 style={{ color: "#dc2626", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>🚫</span> Account Suspended
            </h3>
            <p style={{ color: "#991b1b", fontSize: "0.875rem", margin: 0 }}>
              Your account has been suspended. Please contact support immediately.
            </p>
          </div>
        );
      case "rejected":
        return (
          <div style={{ backgroundColor: "#fef2f2", padding: "1.5rem", borderRadius: "var(--radius-md)", border: "1px solid #fecaca" }}>
            <h3 style={{ color: "#dc2626", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>❌</span> Verification Rejected
            </h3>
            <p style={{ color: "#991b1b", fontSize: "0.875rem", margin: 0 }}>
              Your previous verification request was rejected. Please submit a new request or contact support.
            </p>
            <VerificationForm />
          </div>
        );
      case "not_submitted":
      default:
        return (
          <div style={{ backgroundColor: "var(--color-surface-hover)", padding: "1.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
            <h3 style={{ color: "var(--color-text-heading)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>🛡️</span> Not Verified
            </h3>
            <VerificationForm />
          </div>
        );
    }
  }

  return (
    <div>
      <h1 className="dashboard-title">Profile & Verification</h1>
      
      <div className="dashboard-card" style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.25rem", color: "var(--color-text-heading)", marginBottom: "1rem" }}>
          Trust & Safety
        </h2>
        {renderStatus()}
      </div>

    </div>
  );
}
