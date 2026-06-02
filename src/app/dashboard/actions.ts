"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  const fullName = formData.get("full_name") as string;
  const phone = formData.get("phone") as string;
  const businessName = formData.get("business_name") as string | null;

  const updateData: any = {};
  if (fullName) updateData.full_name = fullName;
  if (phone) updateData.phone = phone;
  if (businessName !== null) updateData.business_name = businessName;

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("user_id", user.id);

  if (error) {
    throw new Error("Failed to update profile: " + error.message);
  }

  revalidatePath("/dashboard/owner/profile");
  revalidatePath("/dashboard/renter/profile");
  
  return { success: true };
}
