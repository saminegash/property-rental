import { createClient } from "@/lib/supabase/server";
import { MarketplaceHeroClient } from "./MarketplaceHeroClient";
import { CarListingCardProps } from "@/components/cars/CarListingCard";
import { PropertyListingCardProps } from "@/components/properties/PropertyListingCard";

export async function MarketplaceHeroSection() {
  const supabase = await createClient();

  // Fetch 1 featured car (or just newest published)
  const { data: carData } = await supabase
    .from("listings")
    .select(`
      id, title, location, listing_type, owner_id,
      vehicle_details ( make, model, year, seats, transmission, fuel_type, mileage, condition ),
      rental_terms ( daily_price, security_deposit_amount, delivery_available, available_with_driver, available_without_driver, daily_driver_fee ),
      listing_images ( image_url, is_primary )
    `)
    .eq("category", "vehicle")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  let featuredCar: CarListingCardProps | null = null;
  if (carData) {
    const rt = Array.isArray(carData.rental_terms) ? carData.rental_terms[0] : carData.rental_terms;
    const images = Array.isArray(carData.listing_images) ? carData.listing_images : [];
    const primaryImage = images.find((img: { is_primary: boolean; image_url: string }) => img.is_primary)?.image_url || images[0]?.image_url || "/placeholder-car.jpg";

    let isVerifiedOwner = false;
    if (carData.owner_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("verification_status")
        .eq("user_id", carData.owner_id)
        .single();
      isVerifiedOwner = profile?.verification_status === "verified";
    }

    featuredCar = {
      id: carData.id,
      title: carData.title,
      location: carData.location,
      image: primaryImage,
      dailyPrice: rt?.daily_price || null,
      driverFee: rt?.daily_driver_fee || 0,
      securityDeposit: rt?.security_deposit_amount || 0,
      deliveryAvailable: rt?.delivery_available || false,
      withDriver: rt?.available_with_driver || false,
      withoutDriver: rt?.available_without_driver || false,
      isFeatured: true,
      isVerifiedOwner,
      href: `/cars/${carData.id}`,
    };
  }

  // Fetch 1 featured property
  const { data: propData } = await supabase
    .from("listings")
    .select(`
      id, title, location, listing_type, owner_id,
      property_details ( bedrooms, bathrooms, area_sqm ),
      rental_terms ( monthly_price, daily_price ),
      listing_images ( image_url, is_primary )
    `)
    .eq("category", "property")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  let featuredProperty: PropertyListingCardProps | null = null;
  if (propData) {
    const pd = Array.isArray(propData.property_details) ? propData.property_details[0] : propData.property_details;
    const rt = Array.isArray(propData.rental_terms) ? propData.rental_terms[0] : propData.rental_terms;
    const images = Array.isArray(propData.listing_images) ? propData.listing_images : [];
    const primaryImage = images.find((img: { is_primary: boolean; image_url: string }) => img.is_primary)?.image_url || images[0]?.image_url || "/placeholder-property.jpg";
    
    // For sale properties, we might not have rental terms. In a real app we'd have a sale price field.
    // For now we'll just fall back to 0 or derive from a future field.
    const price = rt?.monthly_price || rt?.daily_price || 0;

    let isVerified = false;
    if (propData.owner_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("verification_status")
        .eq("user_id", propData.owner_id)
        .single();
      isVerified = profile?.verification_status === "verified";
    }

    featuredProperty = {
      id: propData.id,
      title: propData.title,
      location: propData.location,
      image: primaryImage,
      price: price,
      type: propData.listing_type as "rent" | "sale",
      beds: pd?.bedrooms || 0,
      baths: pd?.bathrooms || 0,
      area: pd?.area_sqm || 0,
      isFeatured: true,
      isVerified,
      href: `/properties/${propData.id}`,
    };
  }

  // Fetch property types for the dropdown
  const { data: propertyTypes } = await supabase
    .from("property_types")
    .select("id, name")
    .order("name", { ascending: true });

  return (
    <MarketplaceHeroClient
      featuredCar={featuredCar}
      featuredProperty={featuredProperty}
      propertyTypes={propertyTypes || []}
    />
  );
}
