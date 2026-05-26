import Link from "next/link";
import React from "react";

export function OwnerCTASection() {
  const benefits = [
    "Free basic listing",
    "Admin-reviewed requests",
    "Flexible pricing",
    "With or without driver"
  ];

  return (
    <section className="owner-cta" id="owner-cta">
      <div className="owner-cta__inner">
        <div className="owner-cta__content">
          <h2 className="owner-cta__title">Own a property or car? Start earning.</h2>
          <p className="owner-cta__subtitle">
            List your property or vehicle, set your price, and let our admin team help manage rental or buyer requests securely.
          </p>
          
          <ul className="owner-cta__benefits">
            {benefits.map((benefit, idx) => (
              <li key={idx} className="owner-cta__benefit-item">
                <svg className="owner-cta__check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                {benefit}
              </li>
            ))}
          </ul>
          
          <div className="owner-cta__actions">
            <Link href="/dashboard/become-owner" className="owner-cta__button">
              List Your Property or Car
            </Link>
          </div>
        </div>
        
        <div className="owner-cta__image-wrapper">
          {/* Decorative placeholder or actual image can be placed here. Using a styled block that fits the theme for now. */}
          <div className="owner-cta__image-placeholder">
            <div className="owner-cta__decorative-circle"></div>
            <div className="owner-cta__decorative-card">
              <span className="owner-cta__decorative-text">New Request Received</span>
              <span className="owner-cta__decorative-price">Admin Pending</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
