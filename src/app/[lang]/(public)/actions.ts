"use server";

import { createClient } from "@/lib/supabase/server";
import { sendAdminNotification } from "@/lib/notifications";
import { revalidatePath } from "next/cache";
import { requestSchema } from "@/lib/validation/requests";
import { email } from "zod";

export async function submitRequest(formData: FormData) {
  const supabase = await createClient();

  const parsed = requestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Invalid data", issues: parsed.error.issues };
  }
  const data = parsed.data;

  // Get user_id if logged in
  const { data: { user } } = await supabase.auth.getUser();

  // Insert request
  const { error } = await supabase.from("requests").insert({...data, 
    user_id: user?.id || null,});

  if (error) {
    throw new Error("Failed to submit request: " + error.message);
  }

  // Fetch listing details for the notification
  const { data: listing } = await supabase
    .from("listings")
    .select("title, property_type, listing_type")
    .eq("id", data.listing_id)
    .single();

  // Fire and forget notification
  if (listing) {
    sendAdminNotification({
      type: listing.listing_type === "rent" ? "rental" : "sale",
      category: listing.property_type === "vehicle" ? "car" : "property",
      renterName: data.name,
      renterPhone: data.phone,
      renterEmail: data.email || undefined,
      message: data.message || undefined,
      listingTitle: listing.title,
      startDate: data.start_date || undefined,
      endDate: data.end_date || undefined,
      budgetAmount: data.offered_price || undefined,
    }).catch((err) => console.error("Failed to send admin notification:", err));
  }

  revalidatePath(`/rent/${data.listing_id}`);
  revalidatePath(`/trade/${data.listing_id}`);
}
