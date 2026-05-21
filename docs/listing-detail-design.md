# Generic Listing Detail Architecture

## Overview
This document outlines the architecture for a unified, generic detail page (`/listings/[id]` or dynamically mapped `/cars/[id]` and `/properties/[id]`). The design relies on our `listings` schema to serve both vehicles and real estate dynamically, separating shared high-level components from category-specific attribute grids.

## Page Layout & Sections

### 1. Shared Detail Sections
These components are universal and must be rendered regardless of whether the listing `category` is "vehicle" or "property".

- **Image Gallery (`ListingGallery.tsx`)**: Hero section displaying the primary and secondary images.
- **Title & Location Header**: Highlighting the listing title, city/subcity location, and listing type (rent/sale).
- **Price Block (`ListingPriceCard.tsx`)**: Prominent display of the daily/monthly or total sale price.
- **Verified Owner Badge (`VerifiedOwnerBadge.tsx`)**: Reusable badge displaying the owner verification status to build trust.
- **Description (`ListingDescription.tsx`)**: The full text description from the `listings` table.
- **Request Button / CTA (`ListingActionCTA.tsx`)**: Replaces the old `RentalRequestForm`. Supports "Send Request" or "Contact Owner" flows.
- **Safety Notice (`TrustSafetyNotice.tsx`)**: A shared component warning users not to pay outside the platform.
- **Similar Listings (`SimilarListings.tsx`)**: Queries the same category and type (e.g., other cars for rent in the same location).

### 2. Car-Specific Sections (`CarDetailsSection.tsx`)
Displayed only when `listing.category === 'vehicle'`. Data is pulled from the `vehicle_details` and `rental_terms` tables.

- **Vehicle Specs**:
  - Make
  - Model
  - Year
  - Vehicle type
  - Seats
  - Fuel type
  - Transmission
  - Mileage
- **Rental Options (If rent)**:
  - Driver option (With driver, Self-drive, or Both)
  - Security deposit
  - Delivery option

### 3. Property-Specific Sections (`PropertyDetailsSection.tsx`)
Displayed only when `listing.category === 'property'`. Data is pulled from the `property_details` and `rental_terms` tables.

- **Property Specs**:
  - Property type
  - Bedrooms
  - Bathrooms
  - Area (sqm)
  - Floor
  - Condition
- **Amenities**:
  - Furnished status
  - Parking availability
  - Compound availability
  - Utilities (Water, Electricity, Internet)

## Component Mapping

| Component | Responsibility | Props |
| --- | --- | --- |
| `ListingDetailPage` | Server component. Fetches data and orchestrates layout. | `params.id` |
| `ListingGallery` | Renders image carousel/grid. | `images: ListingImage[]` |
| `ListingHeader` | Title, Location, Tags. | `title`, `location`, `listingType` |
| `ListingPriceCard` | Main CTA and pricing structure. | `price`, `type`, `owner` |
| `CarDetailsSpecs` | Grid of car attributes. | `vehicleDetails`, `rentalTerms` |
| `PropertyDetailsSpecs`| Grid of property attributes. | `propertyDetails`, `rentalTerms` |
| `ListingActionCTA` | Request form/button. | `listingId`, `type`, `category` |

## Data Requirements

To support this generic view, the server-side fetch must utilize a broad `LEFT JOIN` on both `vehicle_details` and `property_details`. Only one of these will be populated depending on the `category`.

```typescript
const { data: listing, error } = await supabase
  .from("listings")
  .select(`
    id, title, description, location, category, listing_type, owner_id,
    listing_images ( image_url, is_primary, sort_order ),
    rental_terms ( 
      daily_price, monthly_price, security_deposit_amount, 
      available_with_driver, available_without_driver, delivery_available 
    ),
    vehicle_details ( 
      make, model, year, transmission, fuel_type, seats, mileage, condition,
      vehicle_types ( name ) 
    ),
    property_details ( 
      bedrooms, bathrooms, area_sqm, floor, furnished_status, property_condition,
      parking_available, compound_available, water_available, electricity_available, internet_available,
      property_types ( name ) 
    )
  `)
  .eq("id", id)
  .eq("status", "published")
  .single();
```

### RLS Considerations
- The query inherently enforces RLS on the `listings` table.
- Since `owner_public_profiles` is used for trust badges, a secondary query or an admin-role fetch must be performed to retrieve `verification_status` using the `owner_id`.
