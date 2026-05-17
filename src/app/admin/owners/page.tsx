import { createAdminClient } from "@/lib/supabase/admin";
import OwnerCard from "./OwnerCard";

export const dynamic = "force-dynamic";

export default async function AdminOwnersPage() {
  const adminClient = createAdminClient();

  // Fetch all owner profiles
  const { data: owners, error: ownersError } = await adminClient
    .from("owner_profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (ownersError || !owners) {
    return (
      <div className="dashboard-card">
        <h1 className="dashboard-title">Owner Management</h1>
        <div className="auth-error">Error loading owners: {ownersError?.message}</div>
      </div>
    );
  }

  // Fetch the linked user profiles to get email, name, phone, city
  // We can do this in a single query by fetching all profiles for these user_ids
  const userIds = owners.map((o) => o.user_id);
  
  const { data: profiles, error: profilesError } = await adminClient
    .from("profiles")
    .select("user_id, full_name, email, phone, city")
    .in("user_id", userIds);

  if (profilesError) {
    return (
      <div className="dashboard-card">
        <h1 className="dashboard-title">Owner Management</h1>
        <div className="auth-error">Error loading profiles: {profilesError.message}</div>
      </div>
    );
  }

  // Merge the data
  const mergedOwners = owners.map((owner) => {
    const profile = profiles.find((p) => p.user_id === owner.user_id) || {
      full_name: "Unknown",
      email: "Unknown",
      phone: "Unknown",
      city: "Unknown",
    };
    
    return {
      ...owner,
      profile,
    };
  });

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 className="dashboard-title" style={{ marginBottom: 0 }}>Owner Management</h1>
        <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
          {mergedOwners.length} owners total
        </span>
      </div>

      {mergedOwners.length === 0 ? (
        <div className="dashboard-card">
          <p className="dashboard-hint">No owners have onboarded yet.</p>
        </div>
      ) : (
        mergedOwners.map((owner) => (
          <OwnerCard key={owner.id} owner={owner} />
        ))
      )}
    </div>
  );
}
