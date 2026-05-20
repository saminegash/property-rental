# Generic Listing Architecture

This document describes the polymorphic architecture of the Kode Marketplace, designed to seamlessly handle both **Vehicles** and **Properties** using a single robust core.

## The Core: `listings` Table

All inventory on the marketplace is anchored by the `listings` table. This is the single source of truth for the core entity's state, ownership, and searchability.

Key fields:
- **`category`** `(vehicle | property)`: Determines which detail table to join.
- **`listing_type`** `(rent | sale)`: Determines which pricing/terms table to join.
- **`status`**: The global lifecycle state (e.g., `draft`, `pending_review`, `published`, `archived`).
- **`title`, `location`, `description`**: Common metadata.

## The Extensions: Details Tables

We avoid stuffing the `listings` table with sparse, category-specific columns (like `mileage` or `bathrooms`). Instead, we use a **1-to-1 extension pattern**.

### 1. `vehicle_details`
When `listings.category = 'vehicle'`, this table holds the car-specific specs:
- Make, Model, Year
- Transmission, Fuel Type
- Mileage, Seats, Condition

### 2. `property_details`
When `listings.category = 'property'`, this table holds the real estate-specific specs:
- Property Type (Apartment, Villa, etc.)
- Bedrooms, Bathrooms, Area (sqm)
- Furnished Status, Utilities (Water, Electricity, Internet)

*Note: RLS policies on these tables mandate that only the owner of the parent `listing` can insert/update the detail row.*

## The Logic Layers: Terms & Media

### 1. Pricing & Terms (`rental_terms`)
Regardless of whether a listing is a car or a house, if its `listing_type = 'rent'`, it will have a corresponding row in `rental_terms`.
- `daily_price`, `weekly_price`, `monthly_price`
- `security_deposit_amount`
- Domain-specific optional fees (e.g., driver fee for cars, maybe cleaning fees for properties later).

*(Future planning: When `listing_type = 'sale'` is activated, we will create a `sale_terms` table to handle asking prices, installment plans, and negotiation flags).*

### 2. Media (`listing_images`)
The gallery system is fully generic. The `listing_images` table links directly to the base `listing_id`. 
- **Validation**: Enforced heavily in the application layer (`submitForReview`), ensuring both cars and properties meet the required visual quality standard (e.g., 5-10 images).
- **Storage**: RLS policies in Supabase Storage enforce that only the owner of the `listing_id` bucket path can upload files.

## Admin & Mediation Flow

The marketplace relies heavily on administrative mediation for trust.
- **`rental_requests`**: Connects directly to the base `listing_id`.
- The Admin Dashboard resolves the `category` dynamically, pulling either `vehicle_details` or `property_details` to build the context card for the reviewing agent.

## Expanding the Marketplace

To turn on property rentals publicly in the future:
1. Enable the UI toggle for "Property" in the owner dashboard onboarding.
2. Build the `property-details-form.tsx` (using the new `property_details` schema).
3. Ensure the public search page (`/cars`) is generalized or branched to `/properties`, using the `listings.category = 'property'` filter.
