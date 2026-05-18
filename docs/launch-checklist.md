# CarMarket MVP Launch Checklist

This document serves as the final pre-flight checklist before deploying the CarMarket MVP to production. It covers all operational, environmental, and feature-level requirements to ensure the platform launches securely and functions as designed.

## 1. Environment Checklist
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set to the production Supabase project URL.
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set to the production anon key.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set in the server environment (Vercel/hosting provider) and **not** prefixed with `NEXT_PUBLIC_`.
- [ ] Ensure all environment variables strictly conform to `src/lib/env/server.ts` and `client.ts` Zod validation schemas.

## 2. Supabase Checklist
- [ ] Production project is on a paid/pro plan to prevent pausing due to inactivity.
- [ ] Connection pooling is enabled if anticipating high traffic.
- [ ] Custom domain or specific redirect URLs are configured.

## 3. Auth Checklist
- [ ] Supabase Auth is enabled with Email/Password providers.
- [ ] `Site URL` in Supabase Auth settings points to the production domain.
- [ ] `Redirect URLs` in Supabase Auth settings include all production callback routes (e.g., `https://yourdomain.com/auth/callback`).
- [ ] Email templates (Confirmation, Password Reset) are branded and contain correct production links.

## 4. Database Checklist
- [ ] All 12 migration files are successfully applied to the production database (`supabase migration up`).
- [ ] Table relationships (Foreign Keys) are intact and cascade deletions (`ON DELETE CASCADE`) are working as intended for related tables (e.g., deleting a listing deletes its `rental_terms`).
- [ ] Enums (`listing_category`, `listing_status`, `rental_request_status`, `review_role`) are accurately defined.

## 5. Row Level Security (RLS) Checklist
- [ ] `profiles` table RLS restricts users to updating only their own profile.
- [ ] `owner_profiles` table RLS protects business/tax documents from public viewing.
- [ ] `listings` table RLS restricts public users to viewing only `published` listings.
- [ ] `rental_requests` table RLS hides `new_request` and `admin_reviewing` statuses from the vehicle owner to prevent premature contact.
- [ ] `security_deposits` and `commissions` tables prohibit owners from running `UPDATE` operations.

## 6. Storage Checklist
- [ ] A public storage bucket named `car_images` (or appropriate name) is created in the production Supabase instance.
- [ ] Storage RLS policies are applied (e.g., only authenticated users can upload; anyone can view).
- [ ] File size restrictions are configured at the bucket level (e.g., 5MB limit).

## 7. Admin Checklist
- [ ] Initial admin user is created and explicitly granted the `admin` role in the `roles` table.
- [ ] Admin dashboard (`/admin`) is accessible exclusively by the admin account.
- [ ] Admin can view and verify `owner_profiles` (switching status from `pending` to `verified`).
- [ ] Admin can review newly submitted `listings` and switch them from `pending_review` to `published` or `rejected`.

## 8. Owner Flow Checklist
- [ ] Registered users can successfully apply to become owners (`/dashboard/become-owner`).
- [ ] Owners can create a listing, define vehicle specs, and upload images.
- [ ] Owners can submit a completed draft for admin review.
- [ ] Owners can view their approved requests via the `Rental Requests` tab in their dashboard.

## 9. Renter Flow Checklist
- [ ] Anonymous users can browse the public catalog at `/cars`.
- [ ] Renters must log in to submit a request.
- [ ] Renters can accurately submit a booking request specifying dates, delivery needs, and driver requirements.
- [ ] Renters can view the clear breakdown of base price, driver fee, and security deposits before booking.

## 10. Commission Checklist
- [ ] Admin can generate a commission record from a rental request.
- [ ] Commission is accurately isolated at 5% of the base rental rate.
- [ ] System automatically applies the most favorable rate tier (daily, weekly, monthly) based on booking duration.
- [ ] Driver fees and security deposits are successfully excluded from the commission calculation.

## 11. Security Deposit Checklist
- [ ] Admin can initialize a security deposit tracking record.
- [ ] The required amount correctly mirrors the `security_deposit_amount` set by the owner in `rental_terms`.
- [ ] Admin can actively transition the deposit status (Pending -> Collected -> Refunded / Withheld).

## 12. Rating Checklist
- [ ] Production database successfully blocks reviews on requests that are not marked as `completed` (via PostgreSQL trigger).
- [ ] Database successfully prevents duplicate reviews (via `UNIQUE(rental_request_id, reviewer_id)` constraint).
- [ ] Listing detail pages successfully render the aggregated average Owner Rating based on historic completed reviews.

## 13. Known Limitations (MVP Scope)
- **Manual Payments:** There is currently no integrated payment gateway (e.g., Chapa). Payments for rentals, commissions, and deposits are handled offline and manually tracked by the admin.
- **Manual Notifications:** No SMS or Email notifications trigger upon status changes. Users must actively log in to check their dashboard.
- **Image Protections:** While upload logic exists, advanced CDN optimization and aggressive frontend file size constraints are not fully robust.
- **Dispute Resolution:** In the event of a damaged vehicle or withheld security deposit, resolution entirely relies on manual admin mediation off-platform.

## 14. Post-MVP Next Steps (Phase 6 / V2)
1. **Payment Integration:** Implement an Ethiopian-friendly payment gateway (e.g., Chapa) to automate renter payments and owner payouts.
2. **Automated Notifications:** Integrate Twilio (SMS) and Resend (Email) to alert owners of new requests and renters of approved bookings.
3. **Automated Commission Billing:** Transition from manual admin tracking to automated commission deductions during payout.
4. **Complete Ratings UI:** Build out the interactive dual-sided rating submission forms for owners and renters once a booking hits `completed`.
5. **Real-time Chat:** Implement Supabase Realtime to allow renters and owners to communicate securely within the platform post-approval.
