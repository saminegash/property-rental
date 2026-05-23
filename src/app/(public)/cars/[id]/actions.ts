"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { trackListingEvent } from "@/lib/analytics";

export async function submitRentalRequest(formData: FormData) {
  const supabase = await createClient();

  const listing_id = formData.get("listing_id") as string;
  const renter_name = formData.get("renter_name") as string;
  const renter_phone = formData.get("renter_phone") as string;
  const renter_email = formData.get("renter_email") as string;
  const start_date = formData.get("start_date") as string;
  const end_date = formData.get("end_date") as string;
  const needs_driver = formData.get("needs_driver") === "true";
  const needs_delivery = formData.get("needs_delivery") === "true";
  const delivery_location = formData.get("delivery_location") as string;
  const message = formData.get("message") as string;

  if (!listing_id || !renter_name || !renter_phone || !start_date || !end_date) {
    return { error: "Missing required fields" };
  }

  // Fire and forget tracking
  trackListingEvent(listing_id, "request_click");

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
    needs_driver,
    needs_delivery,
    delivery_location: delivery_location || null,
    message: message || null,
    status: "new_request",
  });

  if (error) {
    console.error("Error submitting request:", error);
    return { error: error.message };
  }

  revalidatePath(`/cars/${listing_id}`);
  return { success: true };
}

export async function submitCarSaleInquiry(formData: FormData) {
  const supabase = await createClient();

  const listing_id = formData.get("listing_id") as string;
  const requester_name = formData.get("requester_name") as string;
  const requester_phone = formData.get("requester_phone") as string;
  const requester_email = formData.get("requester_email") as string;
  const message = formData.get("message") as string;
  const preferred_date = formData.get("preferred_date") as string;
  const budget = formData.get("budget") as string;

  if (!listing_id || !requester_name || !requester_phone) {
    return { error: "Missing required fields" };
  }

  // Fire and forget tracking
  trackListingEvent(listing_id, "request_click");

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

  const { error } = await supabase.from("listing_requests").insert({
    listing_id,
    requester_id: user?.id || null, // nullable for public users
    requester_name,
    requester_phone,
    requester_email: requester_email || null,
    request_type: "sale_inquiry",
    message: finalMessage || null,
    preferred_viewing_date: preferred_date || null,
    budget_amount: budget ? parseFloat(budget) : null,
    status: "new_request",
  });

  if (error) {
    console.error("Error submitting car sale inquiry:", error);
    return { error: error.message };
  }

  revalidatePath(`/cars/${listing_id}`);
  return { success: true };
}
