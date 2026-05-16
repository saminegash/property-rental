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
  - Fields: `id`, `owner_id`, `type` (e.g., `car`, `property_rental` for future), `status`, `title`, `description`.
  - To remain scalable, asset-specific attributes (make, model, year) will be stored in a JSONB `attributes` column or a dedicated `car_details` related table.
- **`pricing`:** Either embedded as JSONB in listings or as a separate table.
  - Fields: `base_rental_price`, `driver_fee`, `delivery_fee`, `security_deposit`.
- **`rental_requests`:** 
  - Fields: `id`, `listing_id`, `renter_id`, `start_date`, `end_date`, `status` (`Pending`, `Owner Contacted`, `Confirmed`, `Rejected`), `commission_amount`.

## Storage Strategy
- **Supabase Storage** will be used for all media.
- **Buckets:** 
  - `listing-images`: Publicly readable bucket for vehicle photos. Organized by `listing_id` (e.g., `listing-images/{listing_id}/{uuid}.jpg`).
  - `avatars`: For user profile pictures.
- Next.js `<Image />` component will be configured with remote patterns pointing to the Supabase Storage URL for automatic optimization.

## RLS Strategy
Row Level Security (RLS) will be strictly enforced on all tables.
- **Profiles:** Users can read/update their own profile. Admins have full access.
- **Listings:** 
  - `SELECT`: Publicly accessible for active listings.
  - `INSERT` / `UPDATE`: Only the `owner_id` can modify their own listings.
  - `DELETE`: Only Admins or the owner.
- **Rental Requests:** 
  - `INSERT`: Renters can create a request.
  - `SELECT`: Renters can view *only their own* requests. Owners **cannot** view requests (enforcing the admin intermediation rule). Admins can view all.
  - `UPDATE`: **Admins only.** Renters and Owners cannot modify requests once submitted.

## Admin Request-Control Strategy
As per the core business rules, owners do not receive direct requests.
- When a renter submits a request, it is written to `rental_requests` with a `Pending` status.
- RLS explicitly prevents the car owner from querying this request.
- The Admin dashboard queries all requests. The admin contacts the owner offline/manually to confirm availability.
- Once confirmed, the Admin uses an internal dashboard action (triggering a Server Action utilizing the Service Role or an Admin-privileged session) to update the request status to `Confirmed`.
- The renter is then notified of the update.

## Commission Strategy
- Commission is strictly defined as 5% of the `base_rental_price`.
- Excluded fees: driver fee, delivery fee, security deposit, damage fees.
- **Implementation:** The calculation will **never** be done on the client side. 
- When an Admin confirms a request (or when the request is finalized), a Postgres Database Trigger or a secure Next.js Server Action will read the `base_rental_price` of the listing, calculate the 5%, and save it to the `commission_amount` column in the `rental_requests` table.

## Future Expansion Strategy
To ensure the platform can scale to property rentals and sales:
1. **Generic Core Models:** The primary table is `listings`, not `cars`. The `type` column easily accommodates `property_rental` or `property_sale`.
2. **Flexible Schemas:** Utilizing JSONB for listing `attributes` means we don't need expensive database migrations to add "square footage" or "number of bathrooms" when property support is added.
3. **Decoupled Pricing:** By separating `base_price` from contextual fees, the 5% commission logic will continue to work flawlessly whether the base price refers to a weekly car rental or a monthly apartment lease.
4. **Extensible Frontend:** UI components like `ListingCard` will be polymorphic, capable of rendering different layouts based on the `listing.type`.
