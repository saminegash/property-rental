/**
 * Auth layout is now a passthrough — each auth page owns its own
 * full-bleed two-column layout (logo, copy, form) to match the design.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
