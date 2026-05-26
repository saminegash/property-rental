import React from "react";

export function TrustFeaturesSection() {
  const features = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      title: "Verified Owners",
      description: "Every property and vehicle owner is verified with ID and document checks before listing.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      title: "Admin Reviewed",
      description: "Our admin team mediates all requests to guarantee your safety and trust.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4l3 3" />
        </svg>
      ),
      title: "Flexible Options",
      description: "Rent, buy, or sell. Choose the listing type that suits you — with full admin support.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      title: "Transparent Pricing",
      description: "No hidden fees. You see exactly what you pay for the property, deposit, and services.",
    },
  ];

  return (
    <section className="trust-features" id="trust-features">
      <div className="trust-features__inner">
        <div className="trust-features__grid">
          {features.map((feat, idx) => (
            <div key={idx} className="trust-feature-card">
              <div className="trust-feature-card__icon" aria-hidden="true">
                {feat.icon}
              </div>
              <h3 className="trust-feature-card__title">{feat.title}</h3>
              <p className="trust-feature-card__desc">{feat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
