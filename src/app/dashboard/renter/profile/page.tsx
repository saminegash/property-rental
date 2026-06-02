import React from "react";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function RenterProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, phone, business_name")
    .eq("user_id", user.id)
    .single();

  return (
    <div style={{ maxWidth: "800px" }}>
      <h1 className="dashboard-title">My Profile</h1>
      <p className="dashboard-hint" style={{ marginBottom: "2rem" }}>
        Update your personal details.
      </p>

      <div className="dashboard-card" style={{ padding: "1.5rem" }}>
        <h2 style={{ fontSize: "1.25rem", color: "var(--color-text-heading)", marginBottom: "1rem" }}>
          Personal Information
        </h2>
        <ProfileForm initialData={profile || { full_name: "", email: user.email || "", phone: "", business_name: "" }} />
      </div>
    </div>
  );
}
