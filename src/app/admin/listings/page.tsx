import { createAdminClient } from "@/lib/supabase/admin";
import ListingReviewCard from "./ListingReviewCard";

export const dynamic = "force-dynamic";

export default async function AdminListingsPage() {
  const adminClient = createAdminClient();

  // Fetch pending price changes
  const { data: pendingPriceChanges, error: priceChangesError } = await adminClient
    .from("pending_price_changes")
    .select("id, listing_id, proposed_terms, status, created_at")
    .eq("status", "pending");

  const pendingPriceChangeListingIds = pendingPriceChanges?.map((p) => p.listing_id) || [];

  // Fetch all pending_review listings OR listings with pending price changes
  let query = adminClient
    .from("listings")
    .select("id, title, description, location, category, listing_type, status, owner_id, admin_notes, admin_rejection_reason, created_at");
    
  if (pendingPriceChangeListingIds.length > 0) {
    query = query.or(`status.eq.pending_review,id.in.(${pendingPriceChangeListingIds.join(",")})`);
  } else {
    query = query.eq("status", "pending_review");
  }

  const { data: listings, error: listingsError } = await query.order("created_at", { ascending: true });

  if (listingsError || !listings) {
    return (
      <div className="dashboard-card">
        <h1 className="dashboard-title">Pending Listings</h1>
        <div className="auth-error">
          Error loading listings: {listingsError?.message}
        </div>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <h1 className="dashboard-title" style={{ marginBottom: 0 }}>
            Pending Listings
          </h1>
        </div>
        <div className="dashboard-card">
          <p className="dashboard-hint">
            🎉 No listings pending review. All caught up!
          </p>
        </div>
      </div>
    );
  }

  // Collect all owner_ids to batch-fetch their profiles
  const ownerIds = [...new Set(listings.map((l) => l.owner_id))];

  const { data: profiles } = await adminClient
    .from("profiles")
    .select("user_id, full_name, email, phone, city")
    .in("user_id", ownerIds);

  // Fetch vehicle details for all listings
  const listingIds = listings.map((l) => l.id);

  const { data: vehicleDetails } = await adminClient
    .from("vehicle_details")
    .select(
      "listing_id, make, model, year, transmission, fuel_type, seats, mileage, color, condition, vehicle_type_id, vehicle_types(name)"
    )
    .in("listing_id", listingIds);

  const { data: propertyDetails } = await adminClient
    .from("property_details")
    .select(
      "listing_id, property_type_id, property_types(name), bedrooms, bathrooms, area_sqm, floor, total_floors, furnished_status, parking_available, compound_available, water_available, electricity_available, internet_available, property_condition"
    )
    .in("listing_id", listingIds);

  // Fetch rental terms (pricing + driver options + delivery) for all listings
  const { data: rentalTerms } = await adminClient
    .from("rental_terms")
    .select(
      "listing_id, daily_price, weekly_price, monthly_price, security_deposit_amount, minimum_rental_days, available_with_driver, available_without_driver, daily_driver_fee, weekly_driver_fee, monthly_driver_fee, pickup_available, delivery_available, delivery_fee, estimated_delivery_time"
    )
    .in("listing_id", listingIds);

  const { data: saleTerms } = await adminClient
    .from("sale_terms")
    .select("listing_id, sale_price, is_negotiable")
    .in("listing_id", listingIds);

  // Fetch images for all listings
  const { data: images } = await adminClient
    .from("listing_images")
    .select("id, listing_id, image_url, is_primary, sort_order")
    .in("listing_id", listingIds)
    .order("sort_order", { ascending: true });

  // Build enriched listing objects
  const enrichedListings = listings.map((listing) => {
    const profile = profiles?.find((p) => p.user_id === listing.owner_id) || {
      full_name: "Unknown",
      email: "Unknown",
      phone: null,
      city: null,
    };

    const vd = vehicleDetails?.find(
      (v) => v.listing_id === listing.id
    );

    const pd = propertyDetails?.find(
      (p) => p.listing_id === listing.id
    );

    const rt = rentalTerms?.find((r) => r.listing_id === listing.id);
    const st = saleTerms?.find((s) => s.listing_id === listing.id);
    const pendingChange = pendingPriceChanges?.find((p) => p.listing_id === listing.id);

    const listingImages = (images || []).filter(
      (img) => img.listing_id === listing.id
    );

    return {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      location: listing.location,
      category: listing.category,
      listing_type: listing.listing_type,
      status: listing.status,
      admin_notes: listing.admin_notes,
      created_at: listing.created_at,
      owner: profile,
      pending_price_change: pendingChange
        ? {
            id: pendingChange.id,
            proposed_terms: pendingChange.proposed_terms,
            created_at: pendingChange.created_at,
          }
        : null,
      vehicle_details: vd
        ? {
            make: vd.make,
            model: vd.model,
            year: vd.year,
            transmission: vd.transmission,
            fuel_type: vd.fuel_type,
            seats: vd.seats,
            mileage: vd.mileage,
            color: vd.color,
            condition: vd.condition,
            vehicle_type: Array.isArray(vd.vehicle_types)
              ? (vd.vehicle_types[0] as { name: string } | undefined) ?? null
              : (vd.vehicle_types as { name: string } | null),
          }
        : null,
      rental_terms: rt
        ? {
            daily_price: rt.daily_price,
            weekly_price: rt.weekly_price,
            monthly_price: rt.monthly_price,
            security_deposit_amount: rt.security_deposit_amount,
            minimum_rental_days: rt.minimum_rental_days,
            available_with_driver: rt.available_with_driver,
            available_without_driver: rt.available_without_driver,
            daily_driver_fee: rt.daily_driver_fee,
            weekly_driver_fee: rt.weekly_driver_fee,
            monthly_driver_fee: rt.monthly_driver_fee,
            pickup_available: rt.pickup_available,
            delivery_available: rt.delivery_available,
            delivery_fee: rt.delivery_fee,
          }
        : null,
      sale_terms: st
        ? {
            sale_price: st.sale_price,
            is_negotiable: st.is_negotiable,
          }
        : null,
      property_details: pd
        ? {
            property_type: Array.isArray(pd.property_types)
              ? (pd.property_types[0] as { name: string } | undefined) ?? null
              : (pd.property_types as { name: string } | null),
            bedrooms: pd.bedrooms,
            bathrooms: pd.bathrooms,
            area_sqm: pd.area_sqm,
            floor: pd.floor,
            total_floors: pd.total_floors,
            furnished_status: pd.furnished_status,
            parking_available: pd.parking_available,
            compound_available: pd.compound_available,
            water_available: pd.water_available,
            electricity_available: pd.electricity_available,
            internet_available: pd.internet_available,
            property_condition: pd.property_condition,
          }
        : null,
      images: listingImages.map((img) => ({
        id: img.id,
        image_url: img.image_url,
        is_primary: img.is_primary,
      })),
    };
  });

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1 className="dashboard-title" style={{ marginBottom: 0 }}>
          Pending Listings
        </h1>
        <span className="status-badge status-badge--pending">
          {listings.length} pending
        </span>
      </div>

      {enrichedListings.map((listing) => (
        <ListingReviewCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
