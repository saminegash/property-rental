import Link from "next/link";

export default function CarDetailPage() {
  return (
    <div className="browse-layout">
      <header className="browse-header">
        <div className="browse-header__inner">
          <Link href="/" className="browse-header__logo">
            CarMarket
          </Link>
          <nav className="browse-header__nav">
            <Link href="/cars" className="browse-header__link">
              ← Back to Browse
            </Link>
          </nav>
        </div>
      </header>
      <main className="browse-main" style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <p style={{ fontSize: "1.125rem", color: "var(--color-text-muted)" }}>
          Listing detail page coming soon.
        </p>
        <Link
          href="/cars"
          className="auth-button"
          style={{ textDecoration: "none", marginTop: "1.5rem", display: "inline-block" }}
        >
          Browse Cars
        </Link>
      </main>
    </div>
  );
}
