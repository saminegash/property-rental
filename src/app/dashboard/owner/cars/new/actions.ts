"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const createListingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  location: z.string().min(1, "Location is required"),
});

export async function createListing(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const parseResult = createListingSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    location: formData.get("location"),
  });

  if (!parseResult.success) {
    return { error: parseResult.error.issues[0].message };
  }

  const data = parseResult.data;

  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      owner_id: user.id,
      category: "vehicle",
      listing_type: "rent",
      title: data.title,
      description: data.description || null,
      location: data.location,
      status: "draft",
    })
    .select("id")
    .single();

  if (error) {
    return { error: "Failed to create listing: " + error.message };
  }

  // Redirect to the edit page so the owner can fill in vehicle details & pricing
  redirect(`/dashboard/owner/cars/${listing.id}/edit`);
}
