import Link from "next/link";
import Image from "next/image";

const FOOTER_LINKS = {
  company: [
    { href: "/about", label: "About Us" },
    { href: "/#how-it-works", label: "How It Works" },
    { href: "/properties", label: "Browse Properties" },
    { href: "/dashboard/become-owner", label: "List with Us" },
  ],
  support: [
    { href: "/#help", label: "Help Center" },
    { href: "/safety", label: "Safety Rules" },
    { href: "/contact", label: "Contact Us" },
    { href: "mailto:support@myethioproperties.com", label: "Report a Problem" },
  ],
  legal: [
    { href: "/terms", label: "Terms of Service" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/refund", label: "Refund & Deposit Policy" },
  ],
} as const;

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mp-footer" id="site-footer">
      <div className="mp-footer__inner">
        {/* Top section */}
        <div className="mp-footer__top">
          {/* Brand column */}
          <div className="mp-footer__brand">
            <Link href="/" className="mp-footer__logo" id="footer-logo">
              <Image
                src="/logo.webp"
                alt="MyEthioProperties Logo"
                width={28}
                height={28}
                className="mp-footer__logo-image"
                style={{ height: '28px', width: 'auto', objectFit: 'contain' }}
              />
              <span className="mp-footer__logo-text">MyEthioProperties</span>
            </Link>
            <p className="mp-footer__tagline">
              Your verified property marketplace.
              <br />
              Rent & buy with trust.
            </p>

          </div>

          {/* Link columns */}
          <div className="mp-footer__links-group">
            <div className="mp-footer__col">
              <h3 className="mp-footer__col-title">Company</h3>
              <ul className="mp-footer__list">
                {FOOTER_LINKS.company.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="mp-footer__link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mp-footer__col">
              <h3 className="mp-footer__col-title">Support</h3>
              <ul className="mp-footer__list">
                {FOOTER_LINKS.support.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="mp-footer__link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mp-footer__col">
              <h3 className="mp-footer__col-title">Legal</h3>
              <ul className="mp-footer__list">
                {FOOTER_LINKS.legal.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="mp-footer__link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mp-footer__col">
              <h3 className="mp-footer__col-title">Need help?</h3>
              <ul className="mp-footer__list mp-footer__list--contact">
                <li className="mp-footer__contact-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                  </svg>
                  <span>+251 911 123 456</span>
                </li>
                <li className="mp-footer__contact-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <span>info@myproperties.co</span>
                </li>
                <li className="mp-footer__contact-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>Addis Ababa, Ethiopia</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mp-footer__bottom">
          <p>© {currentYear} MyEthioProperties. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
