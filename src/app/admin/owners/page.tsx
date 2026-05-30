import { createAdminClient } from "@/lib/supabase/admin";
import OwnerCard from "./OwnerCard";

export const dynamic = "force-dynamic";

export default async function AdminOwnersPage() {
  const adminClient = createAdminClient();

  // Fetch owners by joining user_roles (role = 'owner') with profiles
  const { data: ownerRoles, error } = await adminClient
    .from("user_roles")
    .select(
      "user_id, created_at, profiles(user_id, full_name, email, phone, city, business_name, verification_status)"
    )
    .eq("role", "owner")
    .order("created_at", { ascending: false });

  if (error || !ownerRoles) {
    return (
      <div className="dashboard-card">
        <h1 className="dashboard-title">Owner Management</h1>
        <div className="auth-error">Error loading owners: {error?.message}</div>
      </div>
    );
  }

  type OwnerRow = {
    user_id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    city: string | null;
    business_name: string | null;
    verification_status: string;
    joined_at: string;
  };

  // Flatten the joined data into the shape OwnerCard expects
  const owners: OwnerRow[] = ownerRoles
    .map((role) => {
      // Supabase returns the joined relation as an object (single) or array
      const profile = Array.isArray(role.profiles) ? role.profiles[0] : role.profiles;
      if (!profile) return null;

      return {
        user_id: role.user_id,
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        city: profile.city,
        business_name: profile.business_name,
        verification_status: profile.verification_status,
        joined_at: role.created_at,
      };
    })
    .filter((o): o is OwnerRow => o !== null);

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="dashboard-title" style={{ marginBottom: 0 }}>Owner Management</h1>
        <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
          {owners.length} owners total
        </span>
      </div>

      {owners.length === 0 ? (
        <div className="dashboard-card">
          <p className="dashboard-hint">No owners have onboarded yet.</p>
        </div>
      ) : (
        owners.map((owner) => (
          <OwnerCard key={owner.user_id} owner={owner} />
        ))
      )}
    </div>
  );
}
