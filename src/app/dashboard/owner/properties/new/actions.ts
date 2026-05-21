"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const createPropertyDraftSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title is too long"),
  description: z.string().optional(),
  location: z.string().min(3, "Location is required"),
  listing_type: z.enum(["rent", "sale"]),
});

export async function createPropertyListing(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Parse and validate form data
  const parseResult = createPropertyDraftSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    location: formData.get("location"),
    listing_type: formData.get("listing_type"),
  });

  if (!parseResult.success) {
    return { error: parseResult.error.issues[0].message };
  }

  const data = parseResult.data;

  // Insert a new listing as a draft
  const { data: newListing, error } = await supabase
    .from("listings")
    .insert({
      owner_id: user.id,
      category: "property",
      listing_type: data.listing_type,
      title: data.title,
      description: data.description,
      location: data.location,
      status: "draft",
    })
    .select("id")
    .single();

  if (error || !newListing) {
    return { error: error?.message || "Failed to create draft" };
  }

  // Redirect to the property edit page to fill in the rest of the details
  redirect(`/dashboard/owner/properties/${newListing.id}/edit`);
}
