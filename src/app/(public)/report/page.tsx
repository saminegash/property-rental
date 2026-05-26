import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Report an Issue — MyEthioProperties",
  description: "Report a suspicious listing, user, or platform issue to our Trust & Safety team.",
};

export default function ReportPage() {
  return (
    <div className="browse-layout">
      <main style={{ padding: "4rem 1rem", backgroundColor: "var(--color-bg)", minHeight: "100vh" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "1rem", color: "var(--color-text-heading)", textAlign: "center" }}>
            Report an Issue
          </h1>
          <p style={{ fontSize: "1.125rem", color: "var(--color-text-muted)", marginBottom: "3rem", textAlign: "center", lineHeight: 1.6 }}>
            Help us keep the MyEthioProperties community safe.
          </p>

          <div className="dashboard-card" style={{ padding: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-text-heading)", marginBottom: "1rem" }}>
              How to Report
            </h2>
            <p style={{ marginBottom: "1.5rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
              If you have encountered a suspicious listing, a fraudulent owner, or a bug on the platform, please notify our Trust & Safety team immediately.
            </p>

            <div style={{ backgroundColor: "var(--color-surface-hover)", padding: "1.5rem", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", marginBottom: "2rem" }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--color-text-heading)", marginBottom: "0.5rem" }}>
                What to Include in Your Report:
              </h3>
              <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                <li>The Listing ID or URL (if applicable)</li>
                <li>The name of the owner or user involved</li>
                <li>A detailed description of the issue or suspicious behavior</li>
                <li>Any screenshots or proof (if applicable)</li>
              </ul>
            </div>

            <div style={{ textAlign: "center" }}>
              <a 
                href="mailto:support@myethioproperties.com?subject=Trust & Safety Report"
                className="auth-button"
                style={{ display: "inline-flex", textDecoration: "none" }}
              >
                Email Trust & Safety Team
              </a>
            </div>
            
            <p style={{ marginTop: "2rem", fontSize: "0.875rem", color: "var(--color-text-muted)", textAlign: "center" }}>
              Or return to the <Link href="/safety" style={{ color: "var(--color-primary)", textDecoration: "underline" }}>Safety Rules</Link> page.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
