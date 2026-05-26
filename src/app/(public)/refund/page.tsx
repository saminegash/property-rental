import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund & Deposit Policy — MyEthioProperties",
  description: "Information regarding refunds, security deposits, and booking cancellations.",
};

export default function RefundPage() {
  return (
    <div className="browse-layout">
      <main style={{ padding: "4rem 1rem", backgroundColor: "var(--color-bg)", minHeight: "100vh" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "1rem", color: "var(--color-text-heading)", textAlign: "center" }}>
            Refund & Deposit Policy
          </h1>
          <p style={{ fontSize: "1.125rem", color: "var(--color-text-muted)", marginBottom: "3rem", textAlign: "center", lineHeight: 1.6 }}>
            Understanding payments and dispute resolution.
          </p>

          <div className="dashboard-card" style={{ padding: "2rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
            <p style={{ marginBottom: "1rem" }}>
              Because MyEthioProperties acts as a matching marketplace rather than the direct merchant for rentals or sales, the refund and deposit policies are primarily determined by the individual property or vehicle owners.
            </p>

            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-text-heading)", marginTop: "1.5rem", marginBottom: "0.5rem" }}>
              1. Security Deposits
            </h2>
            <p style={{ marginBottom: "1rem" }}>
              Owners often require a security deposit before handing over keys or a vehicle. This deposit is refundable at the end of the rental period, provided the property or vehicle is returned in the same condition it was received. We advise both parties to document the condition with photos prior to the rental.
            </p>

            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-text-heading)", marginTop: "1.5rem", marginBottom: "0.5rem" }}>
              2. Cancellations & Refunds
            </h2>
            <p style={{ marginBottom: "1rem" }}>
              Cancellation policies vary by owner. Any deposit or prepayment made directly to the owner must be refunded according to the terms agreed upon during booking. MyEthioProperties does not hold user funds and cannot forcibly issue a refund.
            </p>

            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-text-heading)", marginTop: "1.5rem", marginBottom: "0.5rem" }}>
              3. Platform Fees
            </h2>
            <p style={{ marginBottom: "1rem" }}>
              Any administrative or service fees paid directly to MyEthioProperties are non-refundable once the service (e.g., admin verification and processing) has been completed.
            </p>
            
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-text-heading)", marginTop: "1.5rem", marginBottom: "0.5rem" }}>
              4. Dispute Resolution
            </h2>
            <p style={{ marginBottom: "1rem" }}>
              If a dispute arises regarding a refund or deposit, we encourage open and respectful communication between the renter/buyer and the owner. Our administrative team may assist in mediation if requested, but we hold no legal authority to compel payment or refunds.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
