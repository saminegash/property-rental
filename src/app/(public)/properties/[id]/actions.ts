"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitPropertyRequest(formData: FormData) {
  const supabase = await createClient();

  const listing_id = formData.get("listing_id") as string;
  const renter_name = formData.get("renter_name") as string;
  const renter_phone = formData.get("renter_phone") as string;
  const renter_email = formData.get("renter_email") as string;
  const start_date = formData.get("start_date") as string;
  const end_date = formData.get("end_date") as string;
  const message = formData.get("message") as string;

  if (!listing_id || !renter_name || !renter_phone || !start_date || !end_date) {
    return { error: "Missing required fields" };
  }

  // Get current user if logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("rental_requests").insert({
    listing_id,
    renter_id: user?.id || null, // nullable for public users
    renter_name,
    renter_phone,
    renter_email: renter_email || null,
    start_date,
    end_date,
    needs_driver: false,
    needs_delivery: false,
    message: message || null,
    status: "new_request",
  });

  if (error) {
    console.error("Error submitting property request:", error);
    return { error: error.message };
  }

  revalidatePath(`/properties/${listing_id}`);
  return { success: true };
}
