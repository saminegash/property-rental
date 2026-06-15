"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z } from "zod";

async function getLocale(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.get("NEXT_LOCALE")?.value || "en";
}

const onboardingSchema = z.object({
  ownerType: z.enum(["individual", "rental_company", "dealer"]),
  businessName: z.string().optional(),
  phone: z.string().min(1, "Phone number is required"),
  city: z.string().min(1, "City is required"),
});

export async function submitOwnerOnboarding(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const parseResult = onboardingSchema.safeParse({
    ownerType: formData.get("ownerType"),
    businessName: formData.get("businessName"),
    phone: formData.get("phone"),
    city: formData.get("city"),
  });

  if (!parseResult.success) {
    return { error: parseResult.error.issues[0].message };
  }

  const data = parseResult.data;

  // 1. Update the base profile with owner information
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      phone: data.phone,
      city: data.city,
      business_name: data.businessName || null,
      verification_status: "pending",
    })
    .eq("user_id", user.id);

  if (profileError) {
    return { error: "Failed to update profile: " + profileError.message };
  }

  // 2. Ensure the user has the 'owner' role assigned safely via admin client
  const adminClient = createAdminClient();

  const { data: existingRole } = await adminClient
    .from("user_roles")
    .select("id")
    .eq("user_id", user.id)
    .eq("role", "owner")
    .maybeSingle();

  if (!existingRole) {
    await adminClient.from("user_roles").insert({
      user_id: user.id,
      role: "owner",
    });
  }

  // 3. Redirect back to the dashboard when complete
  redirect(`/${await getLocale()}/dashboard`);
}
