"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { z } from "zod";

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

  // 1. Update the base profile with phone and city
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      phone: data.phone,
      city: data.city,
    })
    .eq("user_id", user.id);

  if (profileError) {
    return { error: "Failed to update profile: " + profileError.message };
  }

  // 2. Create or update the owner profile (using UPSERT on the unique user_id)
  const { error: ownerProfileError } = await supabase
    .from("owner_profiles")
    .upsert(
      {
        user_id: user.id,
        owner_type: data.ownerType,
        business_name: data.businessName || null,
        verification_status: "pending", // Default as requested
      },
      { onConflict: "user_id" }
    );

  if (ownerProfileError) {
    return {
      error: "Failed to create owner profile: " + ownerProfileError.message,
    };
  }

  // 3. Ensure the user has the 'owner' role assigned safely via admin client
  const adminClient = createAdminClient();

  const { data: roleData } = await adminClient
    .from("roles")
    .select("id")
    .eq("role_name", "owner")
    .single();

  if (roleData) {
    const { data: existingRole } = await adminClient
      .from("user_roles")
      .select("id")
      .eq("user_id", user.id)
      .eq("role_id", roleData.id)
      .maybeSingle();

    if (!existingRole) {
      await adminClient.from("user_roles").insert({
        user_id: user.id,
        role_id: roleData.id,
      });
    }
  }

  // 4. Redirect back to the dashboard when complete
  redirect("/dashboard");
}
