export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-logo">MyEthioProperties</h1>
          <p className="auth-tagline">Verified properties for rent & sale</p>
        </div>
        {children}
      </div>
    </div>
  );
}
