# MVP Task Groups

---

## Task Group 1: Auth, Profiles, and Owner Foundation

### Goal
Bootstrap the Next.js project, wire up Supabase, and deliver a working auth flow with role-aware profiles so that owners, renters, and admins can sign up, log in, and land on role-appropriate dashboards.

### Tasks
- [ ] Initialize Next.js App Router project with `pnpm`.
- [ ] Configure environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) and implement Zod-based validation that fails fast on missing values.
- [ ] Set up Supabase client utilities using `@supabase/ssr`:
  - Browser client (anon key, RLS-bound).
  - Server Component client (cookie-based session).
  - Server Action client (cookie-based session).
  - Service Role client (server-only, never exposed to client).
- [ ] Create `profiles` table migration extending `auth.users` with columns: `role` (`owner` | `renter` | `admin`), `display_name`, `phone`, `avatar_url`.
- [ ] Create a Postgres trigger on `auth.users` insert to auto-create a `profiles` row with a default role of `renter`.
- [ ] Write RLS policies for `profiles`:
  - Users can `SELECT` and `UPDATE` their own profile.
  - Admins can `SELECT` and `UPDATE` all profiles.
- [ ] Build sign-up page with role selection (owner or renter).
- [ ] Build login page with email/password auth.
- [ ] Implement Next.js middleware to protect routes and redirect unauthenticated users.
- [ ] Build role-based layout shell:
  - Owner dashboard skeleton (`/dashboard/owner`).
  - Renter dashboard skeleton (`/dashboard/renter`).
  - Admin dashboard skeleton (`/admin`).
- [ ] Build `/dashboard` auto-router that redirects users by role (admin → /admin, owner → /dashboard/owner, renter → /dashboard/renter).
- [ ] Build profile settings page where users can update their display name, phone, and avatar.
- [ ] Set up `avatars` Supabase Storage bucket and wire avatar upload to profile settings.

### Acceptance Criteria
- [ ] `pnpm dev` starts the application; `pnpm build` succeeds. No `npm` or `yarn` lock files exist.
- [ ] Application refuses to start if any required environment variable is missing.
- [ ] A new user can sign up, a `profiles` row is automatically created, and they are redirected to the correct role dashboard.
- [ ] An existing user can log in and is routed to their role-specific dashboard.
- [ ] Unauthenticated users are redirected to the login page when accessing protected routes.
- [ ] A user can update their profile (name, phone, avatar) and changes persist.
- [ ] RLS prevents a user from reading or modifying another user's profile (verified via Supabase SQL editor or test query).
- [ ] The `SUPABASE_SERVICE_ROLE_KEY` is not present in any client-side bundle (verified via build output inspection).

### Out of Scope
- Listing creation or management (Task Group 2).
- Rental requests, admin intermediation, commission logic (Task Group 3).
- Rating and review system (Task Group 4).
- OAuth/social login providers.
- Email verification or password reset flows.
- Admin user seeding (admins are manually promoted via SQL for MVP).

### Testing Notes
- Manually verify sign-up and login for both owner and renter roles.
- Manually attempt to access `/admin` as a non-admin; confirm redirect to `/dashboard`.
- Use the Supabase SQL editor to confirm RLS blocks cross-user profile reads.
- Inspect the Next.js build output (`pnpm build`) and search for the service-role key string to confirm it is absent from client chunks.

---

## Task Group 2: Rental Listing Foundation

### Goal
Allow car owners to create, edit, and manage car listings with itemized pricing and 5–10 photo uploads. Allow renters to browse, search, and filter available listings. Lay the database groundwork with a generic `listings` table that supports future asset types (property rentals, property sales).

### Tasks
- [ ] Create `listings` table migration:
  - Columns: `id` (uuid), `owner_id` (FK to auth.users), `category` (enum: `vehicle`, future: `property`), `listing_type` (enum: `rent`, future: `sale`), `status` (enum: `draft`, `pending_review`, `published`, `rejected`, `archived`, `suspended`), `title`, `description`, `location`, `is_featured`, `admin_rejection_reason`, `created_at`, `updated_at`.
- [ ] Create `vehicle_details` table migration:
  - Columns: `id`, `listing_id` (FK), `vehicle_type_id` (FK), `make`, `model`, `year`, `transmission`, `fuel_type`, `seats`, `mileage`, `color`, `condition`.
- [ ] Create `rental_terms` table migration:
  - Columns: `id`, `listing_id` (FK), `daily_price`, `weekly_price`, `monthly_price`, `daily_driver_fee`, `weekly_driver_fee`, `monthly_driver_fee`, `security_deposit_amount`, `delivery_fee`, `delivery_available`, `pickup_available`, `minimum_rental_days`, `estimated_delivery_time`, `rental_notes`, `available_with_driver`, `available_without_driver`.
  - Clear separation of commission-eligible price (daily/weekly/monthly_price) vs. exempt fees (driver, delivery, deposit).
- [ ] Write RLS policies for `listings`:
  - `SELECT`: Public for `published` listings. Owners can also see their own non-published listings.
  - `INSERT`: Authenticated users only (owner_id = auth.uid()).
  - `UPDATE`: Owner can update their own listings only.
  - `DELETE`: Owner can delete their own listings.
  - Admin access via service role (bypasses RLS).
- [ ] Write RLS policies for `rental_terms` and `vehicle_details`:
  - Same access pattern as the parent `listings` row.
- [ ] Set up `listing-images` Supabase Storage bucket (public read).
  - Storage policy: only the listing owner can upload/delete images within their listing's folder.
- [ ] Create `listing_images` table migration to track image metadata:
  - Columns: `id`, `listing_id` (FK), `image_url`, `is_primary`, `sort_order`, `created_at`.
- [ ] Build owner listing creation form:
  - Car details fields.
  - Itemized pricing fields (daily/weekly/monthly rental price, driver fee, delivery fee, security deposit).
  - Multi-image upload with drag-and-drop reordering. **Enforce 5–10 photos.**
  - Server Action to validate and insert the listing, vehicle details, rental terms, and image records.
  - Listing created in `draft` status. Owner submits for admin review → `pending_review`.
- [ ] Build owner listing management page (`/dashboard/owner`):
  - List of owner's listings with status badges.
  - Edit and submit-for-review actions.
  - Show `admin_rejection_reason` for rejected listings so owners know why.
- [ ] Build public listing browse page (`/cars`):
  - Grid of published listings with cover image, title, base rental price.
  - Search by location (text filter).
  - Filter by driver option, delivery availability, price range.
  - URL-based filters connected to homepage search and category/location chips.
  - Server Component data fetching.
- [ ] Build listing detail page (`/cars/[id]`):
  - Full photo gallery (5–10 images).
  - All car attributes (make, model, year, transmission, fuel, seats, mileage, color, condition).
  - Itemized pricing breakdown (base price, driver fee, delivery fee, deposit clearly separated).
  - Owner verification badge and rating.
  - CTA button for renters to submit a rental request.
- [ ] Configure Next.js `remotePatterns` in `next.config.js` for Supabase Storage image optimization.

### Acceptance Criteria
- [ ] An owner can create a car listing with all required fields (title, description, car attributes, pricing, 5–10 images) and it appears on their dashboard.
- [ ] An owner can edit their listing details and submit it for admin review.
- [ ] Admin can approve or reject listings. Published listings are visible on the public browse page. Draft, pending, and rejected listings are not.
- [ ] Rejected listings show the rejection reason to the owner.
- [ ] Renters can filter listings by location, driver option, delivery availability, and price range.
- [ ] The listing detail page clearly shows the base rental price separately from driver fee, delivery fee, and security deposit.
- [ ] Images are uploaded to the `listing-images` bucket, optimized via Next.js `<Image />`, and displayed correctly.
- [ ] Listings with fewer than 5 images cannot be submitted for review.
- [ ] RLS prevents a non-owner from editing or deleting another owner's listing (verified via SQL or direct API call).
- [ ] The `listings.category` column defaults to `vehicle` and supports future `property` values.

### Out of Scope
- Rental request submission or management (Task Group 3).
- Commission calculations (Task Group 3).
- Rating and review system (Task Group 4).
- Map-based location search.
- Availability calendar.

### Testing Notes
- Create listings as an owner and verify they appear on the public browse page only when status is `published`.
- Attempt to create a listing as a renter and confirm the Server Action rejects the request.
- Use the Supabase SQL editor to attempt an `UPDATE` on another owner's listing and confirm RLS blocks it.
- Upload images and confirm they are accessible via the public Supabase Storage URL and render correctly through Next.js image optimization.
- Test search and filter combinations to ensure query correctness and empty-state handling.
- Verify that a listing with fewer than 5 images cannot be submitted for review.

---

## Task Group 3: Admin-Controlled Rental Request and Commission

### Goal
Implement the full rental request lifecycle where renters submit requests, admins intermediate and control the process, and the platform calculates a fixed 5% commission on the base rental price only. All other fees (driver, delivery, deposit, damage, penalty) are explicitly excluded from commission.

### Tasks
- [ ] Create `rental_requests` table migration:
  - Columns: `id` (uuid), `listing_id` (FK), `renter_id` (FK to auth.users, nullable for public requests), `renter_name`, `renter_phone`, `renter_email`, `start_date`, `end_date`, `needs_driver`, `needs_delivery`, `delivery_location`, `message`, `status` (enum: `new_request`, `admin_reviewing`, `owner_contacted`, `owner_available`, `owner_unavailable`, `renter_contacted`, `awaiting_payment`, `confirmed`, `active`, `completed`, `cancelled`, `rejected`, `disputed`), `admin_notes`, `owner_response_notes`, `created_at`, `updated_at`.
- [ ] Create `commissions` table migration:
  - Columns: `id`, `rental_request_id` (FK, unique), `commission_rate` (always 5.00), `commission_base_amount` (base_rental_price × days), `commission_amount` (5% of base amount), `commission_status` (enum: `pending`, `collected`, `waived`, `refunded`), `created_at`, `updated_at`.
- [ ] Create `security_deposits` table migration:
  - Columns: `id`, `rental_request_id` (FK), `deposit_amount`, `deposit_status`, `payment_method`, `admin_notes`, `created_at`, `updated_at`.
- [ ] Write RLS policies for `rental_requests`:
  - `INSERT`: Anyone can create a request (status must be `new_request`).
  - `SELECT`: Renters can view only their own requests. Owners can view requests for their listings only when status is beyond `new_request` and `admin_reviewing`. Admins view all via service role.
  - `UPDATE`: Admins only (via service role). Owners can update `owner_response_notes` for requests in owner-facing statuses.
  - `DELETE`: Not permitted for anyone (requests are status-managed, not deleted).
- [ ] Write RLS policies for `commissions`:
  - Owners can view commissions for their own listings.
  - Admins manage all via service role.
- [ ] Implement commission calculation Server Action:
  - **Formula:** `commission_amount = daily_price × rental_days × 0.05`.
  - Only the `daily_price` (or optimized weekly/monthly rate) feeds into the calculation.
  - Driver fee, delivery fee, security deposit, damage fees, late return penalties, and all other extra charges are 100% excluded.
  - Commission is inserted into the `commissions` table when admin confirms a request.
  - Duplicate commission guard prevents generating two commissions for the same request.
- [ ] Build renter request submission flow:
  - Date picker on listing detail page to select rental period.
  - Contact fields (name, phone, optional email).
  - Driver and delivery options.
  - Server Action to validate and insert the request with `new_request` status.
  - Confirmation UI showing the renter their submitted request.
- [ ] Build renter request history page (`/dashboard/renter/requests`):
  - List of the renter's requests with status badges, status descriptions, dates, and listing info.
- [ ] Build admin request management dashboard (`/admin/requests`):
  - List of all rental requests across all listings.
  - Each request shows: renter info, listing info, owner info, dates, pricing, current status, commission, and security deposit.
  - Status transition controls to move a request through the workflow.
  - Admin notes field for internal remarks.
  - Commission auto-generated when status moves to `confirmed`.
- [ ] Server Action for admin status updates:
  - Validates the calling user is an admin (via session + profile role check).
  - Uses the Service Role client to update the request status.
  - Triggers commission calculation on confirmation.
- [ ] Build owner request view (`/dashboard/owner/requests`):
  - Shows requests only after admin has reviewed/contacted the owner (RLS enforced: `new_request` and `admin_reviewing` statuses are hidden).
  - Displays rental dates, renter info (as permitted), driver/delivery options, and status.

### Acceptance Criteria
- [ ] A renter can select dates on a listing and submit a rental request. The request is created with `new_request` status.
- [ ] The submitted request is visible in the admin dashboard immediately. The car owner cannot see requests in `new_request` or `admin_reviewing` status.
- [ ] Owner sees the request only after admin review/contact (status beyond `admin_reviewing`).
- [ ] An admin can transition a request through statuses: `new_request` → `admin_reviewing` → `owner_contacted` → `confirmed` or `rejected`.
- [ ] When a request is confirmed, the `commission_amount` is automatically calculated as 5% of (`daily_price × rental_days`).
- [ ] Driver fees, delivery fees, security deposits, damage fees, late return penalties, and all other extra charges are displayed but explicitly excluded from the commission calculation.
- [ ] A renter can view their request history and see real-time status updates on their dashboard.
- [ ] All admin status update actions use server-only logic; the service-role key is never sent to the client.
- [ ] RLS blocks renters from seeing other renters' requests and blocks owners from seeing requests that admin hasn't passed to them.

### Out of Scope
- Rating and review system (Task Group 4).
- Payment processing or invoicing.
- Automated notifications (email, SMS, push) to owners or renters.
- Penalty or damage fee management.
- Request cancellation by renters after submission.
- Calendar-based availability blocking after a request is confirmed.

### Testing Notes
- Submit a rental request as a renter and verify the admin sees it. Log in as the listing owner and confirm the request is not visible until admin moves it past `admin_reviewing`.
- As an admin, transition a request to `confirmed` and verify the `commission_amount` is 5% of the base rental total:
  - Example: a 5-day rental at 3,000 Birr/day should yield 750 Birr commission (5% of 15,000).
  - Example: a 60-day rental at 1,000 Birr/day should yield 3,000 Birr commission (5% of 60,000).
- Create a listing with a 4,000 Birr/day base price, 500 Birr driver fee, 300 Birr delivery fee, and 5,000 Birr deposit. Submit a 3-day rental request and confirm the commission is 600 Birr (5% of 12,000), not a percentage of any sum that includes the other fees.
- Attempt to update a request status as a renter or owner via direct Supabase API call and confirm RLS blocks it.
- Verify the admin notes field persists across status transitions and is not visible to renters.

---

## Task Group 4: Rating and Review System

### Goal
Implement a rating and review system that allows both renters and owners to rate each other after a completed rental. Aggregated ratings are displayed on listings and owner profiles to build trust.

### Tasks
- [ ] Create `rental_reviews` table migration:
  - Columns: `id` (uuid), `rental_request_id` (FK), `reviewer_id` (FK to auth.users), `reviewee_id` (FK to auth.users), `reviewer_role` (`renter` | `owner`), `reviewee_role` (`renter` | `owner`), `overall_rating` (1–5), `vehicle_rating` (1–5, nullable), `communication_rating` (1–5, nullable), `comment` (text, nullable), `created_at`.
- [ ] Write RLS policies for `rental_reviews`:
  - `INSERT`: Users can only create reviews for their own completed rentals (the associated `rental_request` must have status `completed`).
  - `SELECT`: Public read for all reviews (aggregated scores are shown on listings/profiles).
  - `UPDATE` / `DELETE`: Not permitted (reviews are permanent once submitted).
- [ ] Add unique constraint: one review per `reviewer_id` + `rental_request_id` combination.
- [ ] Build renter review submission form:
  - Appears on the renter dashboard after a rental is completed.
  - Fields: overall rating (1–5 stars), vehicle rating (optional), communication rating (optional), text comment (optional).
  - Server Action validates the user is the renter on the completed request.
- [ ] Build owner review submission form:
  - Appears on the owner dashboard after a rental is completed.
  - Fields: overall rating (1–5 stars), communication rating (optional), text comment (optional).
  - Server Action validates the user is the owner of the listing.
- [ ] Display aggregated owner ratings:
  - On listing detail pages: average owner score + review count.
  - On featured listing cards: star rating + count.
  - On owner profiles (future).
- [ ] Display aggregated renter ratings:
  - Visible to admins and owners on the request detail view.

### Acceptance Criteria
- [ ] After a rental reaches `completed` status, the renter can submit a review of the owner/car.
- [ ] After a rental reaches `completed` status, the owner can submit a review of the renter.
- [ ] Each party can rate the other only once per completed rental (enforced by unique constraint).
- [ ] Reviews cannot be submitted for rentals that haven't reached `completed` status.
- [ ] Aggregated owner ratings are displayed on listing cards and detail pages.
- [ ] RLS prevents users from creating reviews for rentals they are not a party to.
- [ ] Reviews cannot be edited or deleted after submission.

### Out of Scope
- Disputing reviews.
- Admin moderation of review content.
- Vehicle-specific ratings displayed separately from owner ratings.

### Testing Notes
- Complete a rental and verify both the renter and owner can submit reviews.
- Attempt to submit a second review for the same rental and confirm it is rejected.
- Attempt to submit a review for a rental in `confirmed` (not `completed`) status and confirm it is rejected.
- Verify aggregated rating scores appear on listing cards and detail pages.
- Use the Supabase SQL editor to attempt an INSERT into `rental_reviews` with a mismatched `reviewer_id` and confirm RLS blocks it.
