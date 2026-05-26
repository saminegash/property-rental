"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { trackListingEvent } from "@/lib/analytics";

export async function submitPropertyRequest(formData: FormData) {
  const supabase = await createClient();

  const listing_id = formData.get("listing_id") as string;
  const renter_name = formData.get("renter_name") as string;
  const renter_phone = formData.get("renter_phone") as string;
  const renter_email = formData.get("renter_email") as string;
  const message = formData.get("message") as string;
  
  // Rent specific fields
  const start_date = formData.get("start_date") as string;
  const end_date = formData.get("end_date") as string;

  // Sale specific fields
  const preferred_date = formData.get("preferred_date") as string;
  const budget = formData.get("budget") as string;

  if (!listing_id || !renter_name || !renter_phone) {
    return { error: "Missing required fields" };
  }

  // Fire and forget tracking
  trackListingEvent(listing_id, "request_click");

  // Get current user if logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("listing_type")
    .eq("id", listing_id)
    .single();

  if (listingError || !listing) {
    return { error: "Listing not found" };
  }

  if (listing.listing_type === "rent") {
    // Rental request
    const { error } = await supabase.from("rental_requests").insert({
      listing_id,
      renter_id: user?.id || null, // nullable for public users
      renter_name,
      renter_phone,
      renter_email: renter_email || null,
      start_date: start_date || new Date().toISOString(), // Fallback if missing
      end_date: end_date || new Date().toISOString(),
      needs_driver: false,
      needs_delivery: false,
      message: message || null,
      status: "new_request",
    });

    if (error) {
      console.error("Error submitting rental request:", error);
      return { error: error.message };
    }
  } else {
    // Sale inquiry
    const { error } = await supabase.from("listing_requests").insert({
      listing_id,
      requester_id: user?.id || null,
      requester_name: renter_name,
      requester_phone: renter_phone,
      requester_email: renter_email || null,
      request_type: 'sale_inquiry',
      message: message || null,
      preferred_viewing_date: preferred_date || null,
      budget_amount: budget ? parseFloat(budget) : null,
      status: 'new_request',
    });

    if (error) {
      console.error("Error submitting listing request:", error);
      return { error: error.message };
    }
  }

  revalidatePath(`/properties/${listing_id}`);
  return { success: true };
}
