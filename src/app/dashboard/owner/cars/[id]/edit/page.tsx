import Link from "next/link";

export default async function EditCarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="dashboard-card" style={{ maxWidth: "640px", margin: "0 auto" }}>
      <h1 className="dashboard-title">Edit Listing</h1>
      <p className="dashboard-hint" style={{ marginBottom: "1rem" }}>
        Listing ID: <code style={{ fontSize: "0.8125rem" }}>{id}</code>
      </p>
      <p className="dashboard-hint" style={{ marginBottom: "2rem" }}>
        Vehicle details and rental pricing forms will be added in the next steps.
      </p>

      <Link
        href="/dashboard/owner"
        className="auth-button auth-button--secondary"
        style={{ textDecoration: "none", display: "inline-block" }}
      >
        ← Back to My Cars
      </Link>
    </div>
  );
}
