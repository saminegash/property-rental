import Link from "next/link";

export default function Home() {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-logo">CarMarket</h1>
          <p className="auth-tagline">Rental marketplace for Ethiopia</p>
        </div>
        <div className="auth-card" style={{ textAlign: "center" }}>
          <h2 className="auth-title">Get started</h2>
          <p
            style={{
              fontSize: "0.875rem",
              color: "var(--color-text-muted)",
              marginBottom: "1.5rem",
            }}
          >
            Find a car to rent or list yours on the platform.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Link href="/cars" className="auth-button" style={{ textDecoration: "none", textAlign: "center" }}>
              Browse Cars
            </Link>
            <Link href="/signup" className="auth-button auth-button--secondary" style={{ textDecoration: "none", textAlign: "center" }}>
              Create an account
            </Link>
            <Link href="/login" className="auth-button auth-button--secondary" style={{ textDecoration: "none", textAlign: "center" }}>
              Log in
            </Link>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <Link href="/safety" style={{ color: "var(--color-primary)", textDecoration: "none", fontSize: "0.875rem" }}>
            Safety & Marketplace Rules
          </Link>
        </div>
      </div>
    </div>
  );
}
