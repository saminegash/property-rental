"use server";

import { createClient } from "@/lib/supabase/server";
import { sendAdminNotification } from "@/lib/notifications";
import { revalidatePath } from "next/cache";

export async function submitRequest(formData: FormData) {
  const supabase = await createClient();

  const listing_id = formData.get("listing_id") as string;
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = (formData.get("email") as string) || null;
  const message = (formData.get("message") as string) || null;
  const request_type = formData.get("request_type") as "rental" | "purchase" | "viewing" | "info";
  const start_date = (formData.get("start_date") as string) || null;
  const end_date = (formData.get("end_date") as string) || null;
  const offered_price = formData.get("offered_price") ? Number(formData.get("offered_price")) : null;

  if (!listing_id || !name || !phone || !request_type) {
    throw new Error("Listing ID, Name, Phone, and Request Type are required.");
  }

  // Get user_id if logged in
  const { data: { user } } = await supabase.auth.getUser();

  // Insert request
  const { error } = await supabase.from("requests").insert({
    listing_id,
    name,
    phone,
    email,
    message,
    request_type,
    start_date,
    end_date,
    offered_price,
    user_id: user?.id || null,
    status: "new",
  });

  if (error) {
    throw new Error("Failed to submit request: " + error.message);
  }

  // Fetch listing details for the notification
  const { data: listing } = await supabase
    .from("listings")
    .select("title, property_type, listing_type")
    .eq("id", listing_id)
    .single();

  // Fire and forget notification
  if (listing) {
    sendAdminNotification({
      type: listing.listing_type === "rent" ? "rental" : "sale",
      category: listing.property_type === "vehicle" ? "car" : "property",
      renterName: name,
      renterPhone: phone,
      renterEmail: email || undefined,
      message: message || undefined,
      listingTitle: listing.title,
      startDate: start_date || undefined,
      endDate: end_date || undefined,
      budgetAmount: offered_price || undefined,
    }).catch((err) => console.error("Failed to send admin notification:", err));
  }

  revalidatePath(`/rent/${listing_id}`);
  revalidatePath(`/trade/${listing_id}`);
}
