import { createClient } from "@supabase/supabase-js";

async function test() {
  const url = "http://127.0.0.1:54321";
  const key = "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH";
  console.log("Supabase URL: LOCAL (http://127.0.0.1:54321)");

  const supabase = createClient(url, key);
  
  // 1. Fetch listings
  const { data: listings, error: lError } = await supabase.from("listings").select("id, title, category").limit(5);
  console.log("Listings count:", listings?.length);
  console.log("Listings:", listings);

  // 2. Fetch profiles
  const { data: profiles, error: pError } = await supabase.from("profiles").select("*");
  console.log("Profiles count:", profiles?.length);
  console.log("Profiles:", profiles);

  // 3. Fetch property details
  const { data: propDetails, error: pdError } = await supabase.from("property_details").select("listing_id, bedrooms, bathrooms, area_sqm");
  console.log("Property Details count:", propDetails?.length);
  console.log("Property Details:", propDetails);
}

test().catch(console.error);
