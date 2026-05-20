# Implementation Plan: Car Rental Marketplace MVP

## Architecture Overview
- **Framework:** Next.js with App Router for building the frontend, Server Components, and secure API routes.
- **Backend/BaaS:** Supabase for authentication, Postgres database, blob storage, and zero-trust security (RLS).
- **Package Manager:** `pnpm` exclusively (no `npm` or `yarn`).
- **Data Fetching & Mutations:** Heavy reliance on React Server Components (RSC) for read operations and Server Actions for mutations to keep sensitive logic secure and improve performance.

## Supabase Client Strategy
We will use `@supabase/ssr` to properly instantiate clients across different Next.js environments to prevent session leakage and maintain security:
1. **Browser Client:** Used in client components (`"use client"`). Only has access to the anon key and strictly adheres to RLS.
2. **Server Component Client:** Used in RSCs to fetch data securely reading the user's cookies.
3. **Server Action Client:** Used for handling user mutations with cookie-based sessions.
4. **Service Role / Admin Client:** Instantiated *only* within specific server-side contexts (e.g., protected API routes or Server Actions that verify the user is an admin). This client bypasses RLS and is used for admin tasks like updating request states and calculating commissions. **Rule:** The `SUPABASE_SERVICE_ROLE_KEY` will never be prefixed with `NEXT_PUBLIC_` and will never be exposed to the client.

## Environment Validation Strategy
- We will enforce strict environment variable validation at build-time and run-time (e.g., using `zod` or a custom validation script in `next.config.js`).
- Required variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
- If any required variable is missing, the application will fail fast and prevent starting or building.

## Database Strategy
The Postgres database will be structured to support the current car rental MVP while laying the groundwork for future property expansion.
- **`profiles`:** Extends Supabase `auth.users`. Stores `role` (`owner`, `renter`, `admin`), `name`, `contact_info`.
- **`listings`:** The core generic table for assets.
  - Fields: `id`, `owner_id`, `category` (e.g., `vehicle`, `property` for future), `listing_type` (e.g., `rent`, `sale` for future), `status`, `title`, `description`, `location`.
  - Asset-specific attributes stored in dedicated relation tables (`vehicle_details`, future `property_details`).
- **`rental_terms`:** Separate table for pricing.
  - Fields: `daily_price`, `weekly_price`, `monthly_price`, `daily_driver_fee`, `weekly_driver_fee`, `monthly_driver_fee`, `security_deposit_amount`, `delivery_fee`, `delivery_available`, `pickup_available`.
- **`listing_images`:** Image metadata for listing galleries (5–10 images required per listing).
- **`rental_requests`:**
  - Fields: `id`, `listing_id`, `renter_id`, `start_date`, `end_date`, `status` (`new_request`, `admin_reviewing`, `owner_contacted`, `owner_available`, `owner_unavailable`, `renter_contacted`, `awaiting_payment`, `confirmed`, `active`, `completed`, `cancelled`, `rejected`, `disputed`), `admin_notes`, `owner_response_notes`.
- **`commissions`:** Separate table for commission tracking.
  - Fields: `rental_request_id`, `commission_rate` (always 5.00), `commission_base_amount`, `commission_amount`, `commission_status`.
- **`rental_reviews`:** Rating and review system.
  - Fields: `rental_request_id`, `reviewer_id`, `reviewee_id`, `reviewer_role`, `reviewee_role`, `overall_rating` (1–5), `vehicle_rating`, `communication_rating`, `comment`.
  - Ratings are only allowed after a rental reaches `completed` status.

## Storage Strategy
- **Supabase Storage** will be used for all media.
- **Buckets:**
  - `listing-images`: Publicly readable bucket for vehicle photos. Organized by `listing_id` (e.g., `listing-images/{listing_id}/{uuid}.jpg`). Minimum 5, maximum 10 images per listing.
  - `avatars`: For user profile pictures.
- Next.js `<Image />` component will be configured with remote patterns pointing to the Supabase Storage URL for automatic optimization.

## RLS Strategy
Row Level Security (RLS) will be strictly enforced on all tables.
- **Profiles:** Users can read/update their own profile. Admins have full access.
- **Listings:**
  - `SELECT`: Publicly accessible for published listings. Owners can also see their own draft/pending/rejected listings.
  - `INSERT` / `UPDATE`: Only the `owner_id` can modify their own listings.
  - `DELETE`: Only Admins or the owner.
- **Rental Requests:**
  - `INSERT`: Anyone can create a request (public or authenticated).
  - `SELECT`: Renters can view *only their own* requests. Owners can view requests for their listings *only after admin has passed them* (status beyond `new_request` and `admin_reviewing`). Admins can view all (via service role, bypassing RLS).
  - `UPDATE`: Admins only (via service role). Owners can update limited fields (`owner_response_notes`) when a request is in an owner-facing status.
- **Commissions:** Owners can see commissions for their own listings. Admins manage all commissions via service role.
- **Reviews:** Users can only create reviews for their own completed rentals. Public read for aggregated scores.

## Admin Request-Control Strategy
As per the core business rules, owners do not receive direct requests.
- When a renter submits a request, it is written to `rental_requests` with a `new_request` status.
- RLS explicitly prevents the car owner from seeing requests in `new_request` or `admin_reviewing` status.
- The Admin dashboard (using service role) queries all requests. The admin contacts the owner offline/manually to confirm availability.
- Once confirmed, the Admin uses a Server Action (utilizing the Service Role) to update the request status.
- The owner sees the request only after admin review/contact (status moves to `owner_contacted` or beyond).
- The renter can track their request status on their dashboard at all times.

## Commission Strategy
- **Commission is fixed at 5%** of the base rental price only.
- **Calculation:** `commission_amount = base_rental_price × rental_days × 0.05`.
- **Excluded fees:** Driver fee, delivery fee, security deposit, damage fees, late return penalties, and any other extra charges are 100% excluded from commission.
- **Implementation:** The calculation will **never** be done on the client side. When an Admin confirms a request, a secure Next.js Server Action will calculate the amount based solely on `daily_price × days × 0.05` and save it to the `commissions` table.
- **UI display:** The pricing transparency section on the homepage clearly states "5% of rental price only" and lists all excluded fees.

## Rating System Strategy
- **Required for MVP.** Both renters and owners can rate each other after a completed rental.
- **Schema:** `rental_reviews` table with `rental_request_id`, `reviewer_id`, `reviewee_id`, role fields, `overall_rating` (1–5), optional category ratings (`vehicle_rating`, `communication_rating`), and `comment`.
- **Rules:** Ratings are only allowed after a request reaches `completed` status. Each party can rate the other once per completed rental.
- **Display:** Aggregated ratings displayed on listing cards, detail pages, and owner profiles.
- **RLS:** Users can only create reviews for their own completed rentals. Public read for aggregated scores.

## Design Strategy
- **Visual Direction:** Clean white/blue marketplace design, following the uploaded car marketplace and property marketplace design references.
- **Key UI Elements:** Strong hero section, prominent search box, rounded cards with soft shadows, verified/featured badges, trust/safety sections, transparent pricing breakdown.
- **Mobile-First:** All layouts designed for 320px+ and scale up.
- **Gallery:** Listing detail pages feature a 5–10 image gallery.

## Multilingual Strategy
- **Languages:** English (default), Amharic (አማርኛ), Afaan Oromo.
- **Implementation:** Language switcher in the header, externalized strings, RTL not required (all supported languages are LTR).
- **Font:** Inter for Latin, Noto Sans Ethiopic for Amharic/Ethiopic script.

## Future Expansion Strategy
To ensure the platform can scale to property rentals and sales:
1. **Generic Core Models:** The primary table is `listings`, not `cars`. The `category` column accommodates `vehicle` and future `property`. The `listing_type` column supports `rent` and future `sale`.
2. **Dedicated Attribute Tables:** `vehicle_details` for cars, future `property_details` for properties. No JSONB ambiguity.
3. **Decoupled Pricing:** By separating `base_price` from contextual fees, the 5% commission logic continues to work regardless of asset type.
4. **Extensible Frontend:** UI components render differently based on `listing.category` — polymorphic by design.
