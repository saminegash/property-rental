import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — MyEthioProperties",
  description: "How we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="browse-layout">
      <main style={{ padding: "4rem 1rem", backgroundColor: "var(--color-bg)", minHeight: "100vh" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "1rem", color: "var(--color-text-heading)", textAlign: "center" }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: "1.125rem", color: "var(--color-text-muted)", marginBottom: "3rem", textAlign: "center", lineHeight: 1.6 }}>
            Last Updated: May 2026
          </p>

          <div className="dashboard-card" style={{ padding: "2rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
            <p style={{ marginBottom: "1rem" }}>
              MyEthioProperties values your privacy. This policy explains how we collect, use, and safeguard your personal information.
            </p>

            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-text-heading)", marginTop: "1.5rem", marginBottom: "0.5rem" }}>
              1. Information We Collect
            </h2>
            <p style={{ marginBottom: "1rem" }}>
              We collect information you provide directly to us, such as your name, email address, phone number, and any documents provided during the owner verification process. We also automatically collect some usage data, such as IP addresses and browsing behavior on our platform.
            </p>

            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-text-heading)", marginTop: "1.5rem", marginBottom: "0.5rem" }}>
              2. How We Use Your Information
            </h2>
            <p style={{ marginBottom: "1rem" }}>
              Your information is used to provide, maintain, and improve our services. This includes facilitating communication between renters/buyers and owners, processing administrative reviews, and providing customer support.
            </p>

            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-text-heading)", marginTop: "1.5rem", marginBottom: "0.5rem" }}>
              3. Data Sharing
            </h2>
            <p style={{ marginBottom: "1rem" }}>
              We do not sell your personal information. We may share limited contact information between verified parties solely for the purpose of fulfilling a rental or sales inquiry.
            </p>

            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-text-heading)", marginTop: "1.5rem", marginBottom: "0.5rem" }}>
              4. Data Security
            </h2>
            <p style={{ marginBottom: "1rem" }}>
              We implement reasonable security measures to protect your data. However, no method of transmission over the internet or electronic storage is 100% secure.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
