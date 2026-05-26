import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us — MyEthioProperties",
  description: "Learn more about MyEthioProperties, our mission, and the team behind Ethiopia's most trusted property marketplace.",
};

export default function AboutPage() {
  return (
    <div className="browse-layout">
      <main style={{ padding: "4rem 1rem", backgroundColor: "var(--color-bg)", minHeight: "100vh" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "1rem", color: "var(--color-text-heading)", textAlign: "center" }}>
            About MyEthioProperties
          </h1>
          <p style={{ fontSize: "1.125rem", color: "var(--color-text-muted)", marginBottom: "3rem", textAlign: "center", lineHeight: 1.6 }}>
            Building trust in Ethiopia&apos;s real estate and rental market.
          </p>

          <div className="dashboard-card" style={{ padding: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-text-heading)", marginBottom: "1rem" }}>
              Our Mission
            </h2>
            <p style={{ marginBottom: "1rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
              At MyEthioProperties, our mission is to provide a secure, transparent, and seamless platform for buying, selling, and renting properties and vehicles across Ethiopia. We believe that finding your next home or rental vehicle should be a straightforward and trustworthy process.
            </p>

            <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--color-text-heading)", marginTop: "2rem", marginBottom: "1rem" }}>
              Why Choose Us?
            </h2>
            <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
              <li style={{ marginBottom: "0.5rem" }}><strong>Verified Listings:</strong> Every property and vehicle is manually reviewed by our Trust & Safety team.</li>
              <li style={{ marginBottom: "0.5rem" }}><strong>Secure Transactions:</strong> We facilitate safe connections between verified owners and renters/buyers.</li>
              <li style={{ marginBottom: "0.5rem" }}><strong>Local Expertise:</strong> Built in Ethiopia, for the Ethiopian market, understanding local needs and nuances.</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
