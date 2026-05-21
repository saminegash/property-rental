import Link from "next/link";
import React from "react";

export function PropertyOwnerCTASection() {
  const benefits = [
    "Free basic listing",
    "Admin-reviewed requests",
    "Flexible pricing terms",
    "Secure transactions"
  ];

  return (
    <section className="owner-cta" id="owner-cta">
      <div className="owner-cta__inner">
        <div className="owner-cta__content">
          <h2 className="owner-cta__title">Own a property? Start earning from it.</h2>
          <p className="owner-cta__subtitle">
            List your apartment, house, or commercial space. Set your rent or sale price, and let our admin team help manage viewing and purchase requests.
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
              List Your Property Now
            </Link>
          </div>
        </div>
        
        <div className="owner-cta__image-wrapper">
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
