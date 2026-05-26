import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Safety & Marketplace Rules — MyEthioProperties",
  description: "Learn about how MyEthioProperties keeps you safe, our platform rules, and how the rental or buying process works.",
};

export default function SafetyRulesPage() {
  return (
    <div className="browse-layout">


      <main style={{ padding: "4rem 1rem", backgroundColor: "var(--color-bg)" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "1rem", color: "var(--color-text-heading)", textAlign: "center" }}>
            Safety & Marketplace Rules
          </h1>
          <p style={{ fontSize: "1.125rem", color: "var(--color-text-muted)", marginBottom: "3rem", textAlign: "center", lineHeight: 1.6 }}>
            Welcome to MyEthioProperties! We are dedicated to providing a secure and reliable platform for property and car rentals, as well as property sales. Please read our community guidelines and safety protocols to understand how the platform operates.
          </p>

          <div className="dashboard-card" style={{ marginBottom: "2rem", padding: "2rem", borderLeft: "4px solid var(--color-primary)" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-text-heading)", marginBottom: "1rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>🛡️</span> 1. The Admin Verification Process
            </h2>

            <p style={{ marginBottom: "1rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
              At MyEthioProperties, your safety is our highest priority. To build a trusted marketplace, <strong>every single listing is manually reviewed and verified</strong> by our Trust & Safety team before it becomes public.
            </p>

            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginTop: "1.5rem", marginBottom: "0.5rem" }}>What We Verify:</h3>
            <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", color: "var(--color-text-muted)", lineHeight: 1.6, marginBottom: "1rem" }}>
              <li><strong>Owner Identity:</strong> We securely verify the identity of the person listing the property or vehicle.</li>
              <li><strong>Proof of Ownership:</strong> Owners must provide valid documentation or authorization to rent or sell the listing.</li>
              <li><strong>Listing Accuracy:</strong> We check that the location is accurate, the photos are real (not stock images), and the pricing is reasonable.</li>
              <li><strong>Contact Information:</strong> We ensure the owner&apos;s phone number and email are active and reachable.</li>
            </ul>

            <p style={{ marginBottom: "1rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
              Look for the <strong>🛡️ Admin Verified</strong> badge on listings to know that the listing&apos;s owner has passed our rigorous identity and ownership checks.
            </p>
          </div>

          <div className="dashboard-card" style={{ marginBottom: "2rem", padding: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-text-heading)", marginBottom: "1rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem" }}>
              2. The Rental & Buying Process
            </h2>

            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginTop: "1.5rem", marginBottom: "0.5rem" }}>Admin-Mediated Inquiries</h3>
            <p style={{ marginBottom: "1rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
              To protect both renters/buyers and owners, all inquiries are first routed to our administrative team. We conduct an initial screening to prevent spam and ensure the request is legitimate before connecting you with the owner.
            </p>

            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginTop: "1.5rem", marginBottom: "0.5rem" }}>Verify Before Payment</h3>
            <p style={{ marginBottom: "1rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
              Payments for rentals, sales, driver fees, and security deposits are handled directly between you and the owner (or through our verified admins). <strong>Never transfer money</strong> until you have verified the property or vehicle, met the owner or admin in person, and confirmed the transaction details.
            </p>
          </div>

          <div className="dashboard-card" style={{ marginBottom: "2rem", padding: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-text-heading)", marginBottom: "1rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem" }}>
              2. Fees and Payments
            </h2>

            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginTop: "1.5rem", marginBottom: "0.5rem" }}>Commission Explanation</h3>
            <p style={{ marginBottom: "1rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
              MyEthioProperties charges a fixed commission based on the base rental or sale price. This fee helps us maintain the platform and provide support. Our commission does not apply to driver fees, security deposits, or delivery charges.
            </p>

            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginTop: "1.5rem", marginBottom: "0.5rem" }}>Admin Review Fee</h3>
            <p style={{ marginBottom: "1rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
              Our admin team reviews every request at no additional cost to you. This service ensures both parties are verified and that listings meet our quality standards before any transaction takes place.
            </p>

            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginTop: "1.5rem", marginBottom: "0.5rem" }}>Security Deposit Explanation</h3>
            <p style={{ marginBottom: "1rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
              Many owners require a refundable security deposit before move-in or handing over the keys. This deposit acts as a safeguard against minor damages or late returns/move-outs. Once the property or vehicle is returned in its original condition, the deposit is refunded. Our administrative team tracks the collection and refund status of these deposits to ensure transparency.
            </p>
          </div>

          <div className="dashboard-card" style={{ marginBottom: "2rem", padding: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-text-heading)", marginBottom: "1rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "0.5rem" }}>
              3. Responsibilities
            </h2>

            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginTop: "1.5rem", marginBottom: "0.5rem" }}>Renter Responsibilities</h3>
            <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", color: "var(--color-text-muted)", lineHeight: 1.6, marginBottom: "1rem" }}>
              <li>Return the property or vehicle on time and in the exact condition it was received.</li>
              <li>Provide accurate contact information during the request process.</li>
              <li>Communicate clearly with the admin team and owner regarding pickup and drop-off.</li>
              <li>Do not use the property or vehicle for unauthorized commercial activities unless permitted by the owner.</li>
            </ul>

            <h3 style={{ fontSize: "1.125rem", fontWeight: 600, marginTop: "1.5rem", marginBottom: "0.5rem" }}>Owner Responsibilities</h3>
            <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", color: "var(--color-text-muted)", lineHeight: 1.6, marginBottom: "1rem" }}>
              <li>Ensure the property or vehicle is safe, clean, and ready for use before every handover.</li>
              <li>Respond promptly to booking requests once verified by our admin team.</li>
              <li>Clearly communicate any specific rules, quirks, or requirements regarding the property or vehicle.</li>
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
              We strongly advise users to conduct a joint inspection of the property or vehicle before handover and upon return. Any disputes regarding the security deposit or condition should be communicated respectfully. The MyEthioProperties administrative team can offer guidance to help mediate disputes, but direct resolution between the owner and renter/buyer is strongly encouraged.
            </p>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", fontStyle: "italic", marginTop: "1rem" }}>
              Note: This document provides general guidance for using our platform and does not constitute a legally binding contract. All agreements are solely between the owner and the renter/buyer.
            </p>
          </div>

        </div>
      </main>


    </div>
  );
}
