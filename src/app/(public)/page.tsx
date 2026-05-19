import Link from "next/link";

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="mp-hero" id="hero">
        <div className="mp-hero__inner">
          <div className="mp-hero__content">
            <h1 className="mp-hero__title">
              Rent verified cars
              <br />
              with or <strong>without a driver</strong>
            </h1>
            <p className="mp-hero__subtitle">
              Find trusted cars, request rentals, and get your car delivered
              within hours or days.
            </p>
            <div className="mp-hero__cta">
              <Link href="/cars" className="mp-btn mp-btn--primary mp-btn--lg" id="hero-browse-btn">
                Browse Cars
              </Link>
              <Link href="/dashboard/owner/listings/new" className="mp-btn mp-btn--secondary mp-btn--lg" id="hero-list-btn">
                List Your Car
              </Link>
            </div>
            <div className="mp-hero__proof">
              <div className="mp-hero__avatars">
                <span className="mp-hero__avatar">👤</span>
                <span className="mp-hero__avatar">👤</span>
                <span className="mp-hero__avatar">👤</span>
              </div>
              <span className="mp-hero__proof-text">
                Join 2,000+ happy renters
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="mp-trust" id="trust-badges">
        <div className="mp-trust__inner">
          <div className="mp-trust__card">
            <div className="mp-trust__icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1A6DFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h3 className="mp-trust__title">Verified Owners</h3>
            <p className="mp-trust__desc">All owners are verified for your safety</p>
          </div>
          <div className="mp-trust__card">
            <div className="mp-trust__icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1A6DFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3 className="mp-trust__title">Admin Reviewed</h3>
            <p className="mp-trust__desc">Every listing is checked by our admin team</p>
          </div>
          <div className="mp-trust__card">
            <div className="mp-trust__icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1A6DFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            </div>
            <h3 className="mp-trust__title">With or Without Driver</h3>
            <p className="mp-trust__desc">Choose the option that fits your trip</p>
          </div>
          <div className="mp-trust__card">
            <div className="mp-trust__icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1A6DFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
            </div>
            <h3 className="mp-trust__title">Transparent Pricing</h3>
            <p className="mp-trust__desc">Clear price breakdown &amp; low commission</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mp-steps" id="how-it-works">
        <div className="mp-steps__inner">
          <h2 className="mp-section-title">How It Works</h2>
          <div className="mp-steps__grid">
            <div className="mp-steps__step">
              <span className="mp-steps__number">1</span>
              <h3 className="mp-steps__label">Choose a car</h3>
              <p className="mp-steps__desc">Browse available cars and select the one you like.</p>
            </div>
            <div className="mp-steps__step">
              <span className="mp-steps__number">2</span>
              <h3 className="mp-steps__label">Send rental request</h3>
              <p className="mp-steps__desc">Submit your request with dates, driver option and details.</p>
            </div>
            <div className="mp-steps__step">
              <span className="mp-steps__number">3</span>
              <h3 className="mp-steps__label">Admin confirms with owner</h3>
              <p className="mp-steps__desc">Our admin team verifies and confirms availability with the owner.</p>
            </div>
            <div className="mp-steps__step">
              <span className="mp-steps__number">4</span>
              <h3 className="mp-steps__label">Receive the car</h3>
              <p className="mp-steps__desc">Pick up or get delivery and enjoy your trip.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="mp-cta-banner" id="cta-banner">
        <div className="mp-cta-banner__inner">
          <div className="mp-cta-banner__content">
            <h2 className="mp-cta-banner__title">Find your next rental car today</h2>
            <p className="mp-cta-banner__subtitle">Trusted cars. Verified owners. Safe rentals.</p>
          </div>
          <div className="mp-cta-banner__actions">
            <Link href="/cars" className="mp-btn mp-btn--white" id="cta-browse-btn">
              Browse Cars
            </Link>
            <Link href="/dashboard/owner/listings/new" className="mp-btn mp-btn--outline-white" id="cta-list-btn">
              List Your Car
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
