"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createPropertyListing(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const location = formData.get("location") as string;
  const listing_type = formData.get("listing_type") as string; // 'rent' or 'sale'

  if (!title || !location || !listing_type) {
    return { error: "Missing required fields" };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not authenticated" };
  }

  // Insert into listings table
  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      owner_id: user.id,
      category: "property",
      listing_type: listing_type as "rent" | "sale",
      status: "draft",
      title,
      description: description || null,
      location,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Error creating listing:", error);
    return { error: error.message };
  }

  // Redirect to the property edit workflow
  redirect(`/dashboard/owner/properties/${listing.id}/edit`);
}
