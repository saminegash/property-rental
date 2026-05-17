import { createClient } from "@/lib/supabase/server";
import { hasRole } from "@/lib/auth/roles";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const isOwner = await hasRole(user.id, "owner");
  if (!isOwner) {
    redirect("/dashboard/become-owner");
  }

  return (
    <div style={{ width: "100%", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem", borderBottom: "1px solid var(--color-border)", paddingBottom: "1rem", display: "flex", gap: "1rem" }}>
        <Link 
          href="/dashboard/owner" 
          style={{ 
            color: "var(--color-primary)", 
            textDecoration: "none", 
            fontWeight: 600,
            padding: "0.5rem 1rem",
            backgroundColor: "rgba(99, 102, 241, 0.1)",
            borderRadius: "var(--radius-md)"
          }}
        >
          My Cars
        </Link>
        {/* Placeholder for future links like "Bookings", "Earnings" */}
      </div>
      {children}
    </div>
  );
}
