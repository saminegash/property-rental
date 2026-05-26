import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — MyEthioProperties",
  description: "Terms and conditions for using the MyEthioProperties platform.",
};

export default function TermsPage() {
  return (
    <div className="browse-layout">
      <main style={{ padding: "4rem 1rem", backgroundColor: "var(--color-bg)", minHeight: "100vh" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "1rem", color: "var(--color-text-heading)", textAlign: "center" }}>
            Terms of Service
          </h1>
          <p style={{ fontSize: "1.125rem", color: "var(--color-text-muted)", marginBottom: "3rem", textAlign: "center", lineHeight: 1.6 }}>
            Last Updated: May 2026
          </p>

          <div className="dashboard-card" style={{ padding: "2rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
            <p style={{ marginBottom: "1rem" }}>
              Welcome to MyEthioProperties. By accessing or using our platform, you agree to be bound by these Terms of Service.
            </p>

            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-text-heading)", marginTop: "1.5rem", marginBottom: "0.5rem" }}>
              1. General Use
            </h2>
            <p style={{ marginBottom: "1rem" }}>
              MyEthioProperties provides a digital marketplace connecting property and vehicle owners with potential renters and buyers. We do not own any of the properties or vehicles listed on our platform. All transactions and agreements are strictly between the owner and the renter/buyer.
            </p>

            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-text-heading)", marginTop: "1.5rem", marginBottom: "0.5rem" }}>
              2. User Responsibilities
            </h2>
            <p style={{ marginBottom: "1rem" }}>
              Users must provide accurate, current, and complete information during registration and verification. Owners are solely responsible for the accuracy of their listings, ensuring they have the legal right to rent or sell the property/vehicle, and honoring all accepted requests.
            </p>

            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-text-heading)", marginTop: "1.5rem", marginBottom: "0.5rem" }}>
              3. Platform Fees
            </h2>
            <p style={{ marginBottom: "1rem" }}>
              We charge a service commission based on the base price of rentals and sales to maintain the platform and provide administrative support. This fee does not include security deposits, driver fees, or delivery charges.
            </p>

            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-text-heading)", marginTop: "1.5rem", marginBottom: "0.5rem" }}>
              4. Disclaimer of Liability
            </h2>
            <p style={{ marginBottom: "1rem" }}>
              While every listing undergoes an administrative review, MyEthioProperties is not liable for any damages, losses, or disputes arising from transactions made through the platform. We encourage all users to independently verify properties and vehicles before completing any payment.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
