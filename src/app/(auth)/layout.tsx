export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-logo">CarMarket</h1>
          <p className="auth-tagline">Rental marketplace for Ethiopia</p>
        </div>
        {children}
      </div>
    </div>
  );
}
