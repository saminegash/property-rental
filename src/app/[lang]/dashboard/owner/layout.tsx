import { createClient } from "@/lib/supabase/server";
import { hasRole } from "@/lib/auth/roles";
import { redirect } from "next/navigation";
import { OwnerTabsNav } from "@/components/dashboard/OwnerTabsNav";

export default async function OwnerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/${lang}/login`);

  const isOwner = await hasRole(user.id, "owner");
  if (!isOwner) {
    redirect(`/${lang}/dashboard/become-owner`);
  }

  return (
    <div style={{ width: "100%", maxWidth: "1000px", margin: "0 auto" }}>
      <OwnerTabsNav />
      {children}
    </div>
  );
}
