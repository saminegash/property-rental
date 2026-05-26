import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us — MyEthioProperties",
  description: "Get in touch with the MyEthioProperties support team.",
};

export default function ContactPage() {
  return (
    <div className="browse-layout">
      <main style={{ padding: "4rem 1rem", backgroundColor: "var(--color-bg)", minHeight: "100vh" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "1rem", color: "var(--color-text-heading)", textAlign: "center" }}>
            Contact Us
          </h1>
          <p style={{ fontSize: "1.125rem", color: "var(--color-text-muted)", marginBottom: "3rem", textAlign: "center", lineHeight: 1.6 }}>
            We&apos;re here to help. Reach out to our team via email or phone.
          </p>

          <div className="dashboard-card" style={{ padding: "2rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-text-heading)", marginBottom: "0.5rem" }}>
                  Email Support
                </h2>
                <p style={{ color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>
                  For general inquiries, verification requests, and support:
                </p>
                <a href="mailto:support@myethioproperties.com" style={{ color: "var(--color-primary)", textDecoration: "underline", fontWeight: 500 }}>
                  support@myethioproperties.com
                </a>
              </div>
              
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-text-heading)", marginBottom: "0.5rem" }}>
                  Phone
                </h2>
                <p style={{ color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>
                  Available Monday - Friday, 9:00 AM - 5:00 PM (EAT):
                </p>
                <a href="tel:+251911123456" style={{ color: "var(--color-text-heading)", fontWeight: 500 }}>
                  +251 911 123 456
                </a>
              </div>

              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-text-heading)", marginBottom: "0.5rem" }}>
                  Office Location
                </h2>
                <p style={{ color: "var(--color-text-muted)" }}>
                  Addis Ababa, Ethiopia
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
