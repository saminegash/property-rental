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
  - Admin dashboard skeleton (`/dashboard/admin`).
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
- OAuth/social login providers.
- Email verification or password reset flows.
- Admin user seeding (admins are manually promoted via SQL for MVP).

### Testing Notes
- Manually verify sign-up and login for both owner and renter roles.
- Manually attempt to access `/dashboard/admin` as a non-admin; confirm redirect or 403.
- Use the Supabase SQL editor to confirm RLS blocks cross-user profile reads.
- Inspect the Next.js build output (`pnpm build`) and search for the service-role key string to confirm it is absent from client chunks.

---

## Task Group 2: Rental Listing Foundation

### Goal
Allow car owners to create, edit, and manage car listings with itemized pricing and photo uploads. Allow renters to browse, search, and filter available listings. Lay the database groundwork with a generic `listings` table that supports future asset types.

### Tasks
- [ ] Create `listings` table migration:
  - Columns: `id` (uuid), `owner_id` (FK to profiles), `type` (enum: `car`, future: `property_rental`, `property_sale`), `status` (enum: `draft`, `active`, `paused`, `archived`), `title`, `description`, `attributes` (JSONB for make, model, year, color, seats, transmission, fuel type, etc.), `created_at`, `updated_at`.
- [ ] Create `listing_pricing` table migration:
  - Columns: `id`, `listing_id` (FK), `base_rental_price` (numeric), `driver_fee` (numeric, nullable), `delivery_fee` (numeric, nullable), `security_deposit` (numeric, nullable).
  - Clear separation of commission-eligible price vs. exempt fees.
- [ ] Write RLS policies for `listings`:
  - `SELECT`: Public for `active` listings. Owners can also see their own `draft`/`paused` listings.
  - `INSERT`: Authenticated users with `owner` role only.
  - `UPDATE`: Owner can update their own listings only.
  - `DELETE`: Owner or admin.
- [ ] Write RLS policies for `listing_pricing`:
  - Same access pattern as the parent `listings` row.
- [ ] Set up `listing-images` Supabase Storage bucket (public read).
  - Storage policy: only the listing owner can upload/delete images within their listing's folder.
- [ ] Create `listing_images` table migration to track image metadata:
  - Columns: `id`, `listing_id` (FK), `storage_path`, `position` (integer for ordering), `created_at`.
- [ ] Build owner listing creation form:
  - Car details fields driven by the JSONB `attributes` schema.
  - Itemized pricing fields (base rental price, driver fee, delivery fee, security deposit).
  - Multi-image upload with drag-and-drop reordering.
  - Server Action to validate and insert the listing, pricing, and image records.
- [ ] Build owner listing management page (`/dashboard/owner/listings`):
  - List of owner's listings with status badges.
  - Edit and status toggle (active/paused) actions.
- [ ] Build public listing browse page (`/listings`):
  - Grid/list view of active listings with cover image, title, base rental price.
  - Search by keyword (title, make, model).
  - Filter by price range, transmission, fuel type, seats.
  - Server Component data fetching with pagination.
- [ ] Build listing detail page (`/listings/[id]`):
  - Full photo gallery.
  - All car attributes.
  - Itemized pricing breakdown (base price, driver fee, delivery fee, deposit clearly separated).
  - CTA button for renters to request (wired in Task Group 3).
- [ ] Configure Next.js `remotePatterns` in `next.config.js` for Supabase Storage image optimization.

### Acceptance Criteria
- [ ] An owner can create a car listing with all required fields (title, description, car attributes, pricing, images) and it appears on their dashboard.
- [ ] An owner can edit their listing details and toggle its status between active and paused.
- [ ] Active listings are visible on the public browse page. Draft and paused listings are not.
- [ ] Renters can search listings by keyword and filter by price, transmission, fuel type, and seats.
- [ ] The listing detail page clearly shows the base rental price separately from driver fee, delivery fee, and security deposit.
- [ ] Images are uploaded to the `listing-images` bucket, optimized via Next.js `<Image />`, and displayed correctly.
- [ ] RLS prevents a non-owner from editing or deleting another owner's listing (verified via SQL or direct API call).
- [ ] The `listings.type` column defaults to `car` and the JSONB `attributes` structure is documented for future asset types.

### Out of Scope
- Rental request submission or management (Task Group 3).
- Commission calculations (Task Group 3).
- Admin listing moderation or approval workflow.
- Map-based location search.
- Availability calendar.

### Testing Notes
- Create listings as an owner and verify they appear on the public browse page only when status is `active`.
- Attempt to create a listing as a renter and confirm the Server Action rejects the request.
- Use the Supabase SQL editor to attempt an `UPDATE` on another owner's listing and confirm RLS blocks it.
- Upload images and confirm they are accessible via the public Supabase Storage URL and render correctly through Next.js image optimization.
- Test search and filter combinations to ensure query correctness and empty-state handling.

---

## Task Group 3: Admin-Controlled Rental Request, Commission, and Rating Plan

### Goal
Implement the full rental request lifecycle where renters submit requests, admins intermediate and control the process, and the platform calculates commission using a tiered model: flat fee (300–1,000 Birr) for short-term rentals based on daily price, or 8% for long-term rentals — strictly on the base rental price. Document the rating system design for post-MVP implementation.

### Tasks
- [ ] Create `rental_requests` table migration:
  - Columns: `id` (uuid), `listing_id` (FK), `renter_id` (FK to profiles), `start_date`, `end_date`, `status` (enum: `pending`, `owner_contacted`, `confirmed`, `rejected`, `completed`, `cancelled`), `total_rental_price` (computed: base price × duration), `commission_amount` (numeric), `admin_notes` (text, nullable), `created_at`, `updated_at`.
- [ ] Write RLS policies for `rental_requests`:
  - `INSERT`: Renters can create a request for an active listing.
  - `SELECT`: Renters can view only their own requests. Owners **cannot** see requests at all. Admins can view all requests.
  - `UPDATE`: Admins only.
  - `DELETE`: Not permitted for anyone (requests are status-managed, not deleted).
- [ ] Create a Postgres function or trigger for tiered commission calculation:
  - Determine rental type: short-term (1–30 days) or long-term (31+ days).
  - **Short-term:** Apply flat fee based on daily base rental price (≤ 2,000 Birr/day → 300 Birr; 2,001–5,000 → 600 Birr; > 5,000 → 1,000 Birr).
  - **Long-term:** Compute `commission_amount = base_rental_price × rental_days × 0.08`.
  - Only the `base_rental_price` feeds into the calculation. Driver fee, delivery fee, security deposit are excluded.
- [ ] Build renter request submission flow:
  - Date picker on listing detail page to select rental period.
  - Server Action to compute `total_rental_price` (base price × number of days), validate dates, and insert the request with `pending` status.
  - Confirmation UI showing the renter their submitted request and its status.
- [ ] Build renter request history page (`/dashboard/renter/requests`):
  - List of the renter's requests with status, dates, listing info, and pricing breakdown.
- [ ] Build admin request management dashboard (`/dashboard/admin/requests`):
  - Filterable table of all rental requests across all listings.
  - Each request row shows: renter info, listing info, owner info, dates, pricing, and current status.
  - Status transition controls (dropdown or buttons) to move a request through the workflow: `pending` → `owner_contacted` → `confirmed` / `rejected`.
  - Admin notes field for internal remarks.
  - Commission amount auto-populated and displayed when status moves to `confirmed`, showing the tier applied (flat fee or 8%).
- [ ] Build admin request detail view:
  - Full breakdown of the request: listing details, renter contact info, owner contact info, itemized pricing, commission calculation, and status history.
- [ ] Server Action for admin status updates:
  - Validates the calling user is an admin (via session + profile role check).
  - Uses the Service Role client to update the request status.
  - Triggers commission calculation on confirmation.
- [ ] Build owner notification display (lightweight):
  - After admin confirms and facilitates the connection, the owner sees a minimal "confirmed rental" entry in their dashboard showing only the dates and renter name (no direct request queue).
- [ ] Document the rating system plan for post-MVP:
  - Schema design: `ratings` table with `request_id` (FK), `reviewer_id`, `reviewee_id`, `role` (owner_rates_renter | renter_rates_owner), `score` (1–5), `comment`, `created_at`.
  - Rules: ratings are only allowed after a request reaches `completed` status. Each party can rate the other once per completed rental.
  - RLS: users can only create ratings for their own completed rentals. Public read for aggregated scores.

### Acceptance Criteria
- [ ] A renter can select dates on a listing and submit a rental request. The request is created with `pending` status.
- [ ] The submitted request is visible in the admin dashboard immediately. The car owner cannot see the request in any view.
- [ ] An admin can transition a request through statuses: `pending` → `owner_contacted` → `confirmed` or `rejected`.
- [ ] When a request is confirmed, the `commission_amount` is automatically calculated using the correct tier:
  - Short-term (1–30 days): flat fee of 300, 600, or 1,000 Birr based on daily base rental price.
  - Long-term (31+ days): exactly 8% of `total_rental_price` (derived solely from `base_rental_price × days`).
- [ ] Driver fees, delivery fees, and security deposits are displayed but explicitly excluded from the commission calculation.
- [ ] A renter can view their request history and see real-time status updates.
- [ ] All admin status update actions use server-only logic; the service-role key is never sent to the client.
- [ ] RLS blocks renters from seeing other renters' requests and blocks owners from seeing any requests.
- [ ] The rating system design document exists and is ready for post-MVP implementation.

### Out of Scope
- Implementing the rating system (documented only).
- Payment processing or invoicing.
- Automated notifications (email, SMS, push) to owners or renters.
- Penalty or damage fee management.
- Request cancellation by renters after submission.
- Calendar-based availability blocking after a request is confirmed.

### Testing Notes
- Submit a rental request as a renter and verify the admin sees it. Log in as the listing owner and confirm the request is not visible.
- As an admin, transition a request to `confirmed` and verify the `commission_amount` column is populated correctly:
  - Short-term example: a 5-day rental at 3,000 Birr/day should yield a 600 Birr flat commission (mid-tier).
  - Long-term example: a 60-day rental at 1,000 Birr/day should yield 4,800 Birr commission (8% of 60,000).
- Create a listing with a 4,000 Birr/day base price, 500 Birr driver fee, 300 Birr delivery fee, and 5,000 Birr deposit. Submit a 3-day rental request and confirm the commission is 600 Birr (mid-tier flat fee), not a percentage of any sum that includes the other fees.
- Attempt to update a request status as a renter or owner via direct Supabase API call and confirm RLS blocks it.
- Verify the admin notes field persists across status transitions and is not visible to renters.
