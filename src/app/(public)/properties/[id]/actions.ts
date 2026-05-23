"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitPropertyRequest(formData: FormData) {
  const supabase = await createClient();

  const listing_id = formData.get("listing_id") as string;
  const renter_name = formData.get("renter_name") as string;
  const renter_phone = formData.get("renter_phone") as string;
  const renter_email = formData.get("renter_email") as string;
  const message = formData.get("message") as string;
  
  // Rent specific fields
  let start_date = formData.get("start_date") as string;
  let end_date = formData.get("end_date") as string;

  // Sale specific fields
  const preferred_date = formData.get("preferred_date") as string;
  const budget = formData.get("budget") as string;

  if (!listing_id || !renter_name || !renter_phone) {
    return { error: "Missing required fields" };
  }

  // If start_date and end_date are missing (it's a sale inquiry), use today's date to bypass the NOT NULL constraint on rental_requests
  // TODO: Create a generic 'inquiries' or 'listing_requests' table to separate sales inquiries from rental requests.
  if (!start_date || !end_date) {
    const today = new Date().toISOString().split("T")[0];
    start_date = today;
    end_date = today;
  }

  let finalMessage = message || "";
  if (preferred_date || budget) {
    const details = [];
    if (preferred_date) details.push(`Preferred viewing date: ${preferred_date}`);
    if (budget) details.push(`Budget: ${budget} ETB`);
    finalMessage = `${details.join("\n")}\n\n${finalMessage}`.trim();
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
    message: finalMessage || null,
    status: "new_request",
  });

  if (error) {
    console.error("Error submitting property request:", error);
    return { error: error.message };
  }

  revalidatePath(`/properties/${listing_id}`);
  return { success: true };
}
