import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Safety & Marketplace Rules — CarMarket",
  description: "Learn about how CarMarket keeps you safe, our platform rules, and how the rental process works.",
};

export default function SafetyRulesPage() {
  return (
    <div className="browse-layout">
      {/* Header */}
      <header className="browse-header">
        <div className="browse-header__inner">
          <Link href="/" className="browse-header__logo">
            CarMarket
          </Link>
          <nav className="browse-header__nav">
            <Link href="/cars" className="browse-header__link">
              ← Browse
            </Link>
            <Link href="/login" className="browse-header__link">
              Log in
            </Link>
            <Link
              href="/signup"
              className="auth-button"
              style={{
                textDecoration: "none",
                padding: "0.5rem 1.25rem",
                fontSize: "0.8125rem",
              }}
            >
              Sign up
            </Link>
          </nav>
        </div>
      </header>

      <main style={{ padding: "4rem 1rem", backgroundColor: "var(--color-bg)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "1rem", color: "var(--color-text-heading)", textAlign: "center" }}>
            Safety & Marketplace Rules
          </h1>
          <p style={{ fontSize: "1.125rem", color: "var(--color-text-muted)", marginBottom: "3rem", textAlign: "center", lineHeight: 1.6 }}>
            Welcome to CarMarket! We are dedicated to providing a secure and reliable platform for car rentals. Please read our community guidelines and safety protocols to understand how the platform operates.
          </p>

          <div className="dashboard-card" style={{ marginBottom: "2rem", padding: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-text-heading)", marginBottom: "1rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem" }}>
              1. The Rental Process
            </h2>
            
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginTop: "1.5rem", marginBottom: "0.5rem" }}>Admin-Controlled Review Process</h3>
            <p style={{ marginBottom: "1rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
              To ensure safety and quality, all rental requests are first reviewed by our administrative team. Owners will only be notified of a request once our team has completed an initial verification. This prevents spam and protects both parties.
            </p>

            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginTop: "1.5rem", marginBottom: "0.5rem" }}>Verify Owner Before Payment</h3>
            <p style={{ marginBottom: "1rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
              Payments for the rental, driver fees, and security deposits are handled directly between you and the owner (or through our verified admins). <strong>Never transfer money</strong> until you have verified the vehicle, met the owner or admin in person, and confirmed the booking status on your CarMarket dashboard.
            </p>
          </div>

          <div className="dashboard-card" style={{ marginBottom: "2rem", padding: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-text-heading)", marginBottom: "1rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem" }}>
              2. Fees and Payments
            </h2>
            
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginTop: "1.5rem", marginBottom: "0.5rem" }}>Commission Explanation</h3>
            <p style={{ marginBottom: "1rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
              CarMarket charges a fixed 5% commission based strictly on the base rental price. This fee helps us maintain the platform and provide support. Our commission does not apply to driver fees, security deposits, or delivery charges.
            </p>

            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginTop: "1.5rem", marginBottom: "0.5rem" }}>Driver Fee Explanation</h3>
            <p style={{ marginBottom: "1rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
              If you request a vehicle with a driver, the driver fee is calculated separately from the rental cost. This fee goes entirely to covering the cost of the professional driver and is paid directly along with the rental cost.
            </p>

            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginTop: "1.5rem", marginBottom: "0.5rem" }}>Security Deposit Explanation</h3>
            <p style={{ marginBottom: "1rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
              Many owners require a refundable security deposit before handing over the keys. This deposit acts as a safeguard against minor damages or late returns. Once the vehicle is returned in its original condition, the deposit is refunded to the renter. Our administrative team tracks the collection and refund status of these deposits to ensure transparency.
            </p>
          </div>

          <div className="dashboard-card" style={{ marginBottom: "2rem", padding: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-text-heading)", marginBottom: "1rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem" }}>
              3. Responsibilities
            </h2>
            
            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginTop: "1.5rem", marginBottom: "0.5rem" }}>Renter Responsibilities</h3>
            <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", color: "var(--color-text-muted)", lineHeight: 1.6, marginBottom: "1rem" }}>
              <li>Return the vehicle on time and in the exact condition it was received.</li>
              <li>Provide accurate contact information during the request process.</li>
              <li>Communicate clearly with the admin team and owner regarding pickup and drop-off.</li>
              <li>Do not use the vehicle for unauthorized commercial activities unless permitted by the owner.</li>
            </ul>

            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginTop: "1.5rem", marginBottom: "0.5rem" }}>Owner Responsibilities</h3>
            <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", color: "var(--color-text-muted)", lineHeight: 1.6, marginBottom: "1rem" }}>
              <li>Ensure the vehicle is safe, clean, and mechanically sound before every trip.</li>
              <li>Respond promptly to booking requests once verified by our admin team.</li>
              <li>Clearly communicate any specific rules, quirks, or requirements regarding the vehicle.</li>
              <li>Honor the agreed-upon rental prices and terms listed on the platform.</li>
            </ul>
          </div>

          <div className="dashboard-card" style={{ marginBottom: "2rem", padding: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-text-heading)", marginBottom: "1rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem" }}>
              4. Damage & Dispute Guidance
            </h2>
            <p style={{ marginBottom: "1rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
              In the unlikely event of damage, an accident, or a disagreement, both parties should document the situation immediately with photos and written notes. 
            </p>
            <p style={{ marginBottom: "1rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
              We strongly advise renters and owners to conduct a joint walk-around inspection of the vehicle before departure and upon return. Any disputes regarding the security deposit or vehicle condition should be communicated respectfully. The CarMarket administrative team can offer guidance to help mediate disputes, but direct resolution between the owner and renter is strongly encouraged.
            </p>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", fontStyle: "italic", marginTop: "1rem" }}>
              Note: This document provides general guidance for using our platform and does not constitute a legally binding contract. All agreements are solely between the vehicle owner and the renter.
            </p>
          </div>

        </div>
      </main>

      <footer className="browse-footer">
        <p>© {new Date().getFullYear()} CarMarket. All rights reserved.</p>
        <div style={{ marginTop: "1rem", display: "flex", gap: "1.5rem", justifyContent: "center" }}>
          <Link href="/safety" style={{ color: "var(--color-primary)", textDecoration: "none" }}>Safety & Rules</Link>
        </div>
      </footer>
    </div>
  );
}
