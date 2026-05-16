# Checkpoint 4: Car Rental Marketplace MVP

## What This Checkpoint Delivers

A fully functional, rental-first car marketplace where three user roles interact through a centralized, admin-controlled workflow:

- **Authentication & Profiles:** Email/password sign-up and login via Supabase Auth. Role-aware profiles (`owner`, `renter`, `admin`) with auto-creation on sign-up. Role-based dashboards and protected routing via Next.js middleware.
- **Car Listings:** Owners create and manage car listings with itemized pricing (base rental price, driver fee, delivery fee, security deposit) and multi-image uploads. Renters browse, search, and filter active listings on a public page.
- **Admin-Controlled Rental Requests:** Renters submit rental requests that are visible only to admins. Admins intermediate the entire process — contacting owners offline, updating request statuses (`pending` → `owner_contacted` → `confirmed` / `rejected`), and recording internal notes. Owners never see requests directly.
- **Commission Calculation:** Automatic, server-side tiered commission on the base rental price when a request is confirmed: flat 300–1,000 Birr for short-term (1–30 days) based on daily price, or 8% for long-term (31+ days).
- **Rating System Design:** A documented schema and rules for a post-MVP rating system, ready for implementation in a future checkpoint.
- **Scalable Architecture:** Generic `listings` table with a `type` column and JSONB `attributes`, designed to support future asset categories without schema rewrites.

## What This Checkpoint Does Not Deliver

- Payment processing, invoicing, or any financial transaction handling.
- Automated notifications (email, SMS, push) to any user role.
- Direct in-app messaging between owners and renters.
- Instant or automated booking (all bookings require admin intermediation).
- Car sales functionality.
- Property rentals or property sales.
- Rating and review system implementation (design documented only).
- OAuth or social login providers.
- Email verification or password reset flows.
- Penalty, damage fee, or dispute management systems.
- Map-based location search or availability calendar.
- Request cancellation by renters after submission.

## Key Business Rules

1. **Admin Intermediation:** Every rental request passes through an admin before the owner is aware of it. Owners never receive direct requests. RLS enforces this at the database level.
2. **Tiered Commission on Rental Price Only:** The platform uses a tiered model:
   - **Short-term (1–30 days):** Flat fee of 300–1,000 Birr, determined by the listing's daily base rental price (≤ 2,000 → 300; 2,001–5,000 → 600; > 5,000 → 1,000 Birr).
   - **Long-term (31+ days):** 8% of `base_rental_price × rental days`.
3. **Exempt Fees:** Driver fees, delivery fees, security deposits, penalties, and damage fees are fully excluded from commission calculations. They are tracked and displayed but never feed into the commission formula.
4. **Server-Only Sensitive Logic:** Commission calculations and admin status transitions execute exclusively on the server. The Supabase service-role key is never exposed to the client.
5. **Role Defaults:** New users default to `renter`. Admins are promoted manually via SQL during the MVP phase.

## Main Database Areas

| Table | Purpose |
|---|---|
| `profiles` | Extends `auth.users` with `role`, `display_name`, `phone`, `avatar_url` |
| `listings` | Generic asset table with `type` (car, future: property), `status`, `attributes` (JSONB) |
| `listing_pricing` | Itemized pricing: `base_rental_price`, `driver_fee`, `delivery_fee`, `security_deposit` |
| `listing_images` | Image metadata: `storage_path`, `position` for ordering |
| `rental_requests` | Request lifecycle: `renter_id`, `listing_id`, dates, `status`, `total_rental_price`, `commission_amount`, `admin_notes` |

**Storage Buckets:**
- `listing-images` — Publicly readable, owner-write-only, organized by listing ID.
- `avatars` — User profile pictures.

## Admin-Controlled Rental Flow

```
Renter submits request
        │
        ▼
  ┌─────────────┐
  │   pending    │  ← Only visible to renter (own) + admin
  └──────┬──────┘
         │  Admin reviews request
         ▼
  ┌──────────────────┐
  │ owner_contacted  │  ← Admin contacts owner offline
  └──────┬───────────┘
         │  Owner responds
         ▼
   ┌─────┴──────┐
   │            │
   ▼            ▼
┌──────────┐ ┌──────────┐
│ confirmed│ │ rejected │
└────┬─────┘ └──────────┘
     │
     │  Commission auto-calculated (tiered: flat fee or 8%)
     │  Owner sees confirmed rental in dashboard
     ▼
┌──────────┐
│ completed│  ← Admin marks after rental period ends
└──────────┘
```

**Key enforcement points:**
- RLS blocks owners from `SELECT` on `rental_requests` entirely.
- RLS blocks renters from seeing other renters' requests.
- Only admins can `UPDATE` request status.
- Commission triggers on status change to `confirmed`.

## Commission Rule: Tiered Model on Rental Price Only

**Short-term (1–30 days) — Flat fee by daily price tier:**
| Daily Base Rental Price | Commission |
|---|---|
| ≤ 2,000 Birr/day | 300 Birr (flat) |
| 2,001–5,000 Birr/day | 600 Birr (flat) |
| > 5,000 Birr/day | 1,000 Birr (flat) |

**Long-term (31+ days) — Percentage:**
```
commission_amount = base_rental_price × number_of_days × 0.08
```

**Short-term example:**
| Field | Value |
|---|---|
| Base rental price | 3,000 Birr/day |
| Rental duration | 5 days |
| Driver fee | 500 Birr/day |
| Delivery fee | 300 Birr |
| Security deposit | 5,000 Birr |
| **Total rental price** | **15,000 Birr** (3,000 × 5) |
| **Commission (flat, mid-tier)** | **600 Birr** |
| Fees excluded from commission | 8,300 Birr (driver + delivery + deposit) |

**Long-term example:**
| Field | Value |
|---|---|
| Base rental price | 1,000 Birr/day |
| Rental duration | 60 days |
| **Total rental price** | **60,000 Birr** (1,000 × 60) |
| **Commission (8%)** | **4,800 Birr** |

**Implementation:** Calculated by a Postgres trigger or secure Server Action when an admin confirms the request. Never computed on the client.

## Future Property Marketplace Expansion

The MVP architecture is designed to accommodate future asset types with minimal friction:

1. **Generic `listings.type` column:** Currently defaults to `car`. Adding `property_rental` or `property_sale` requires only a new enum value, not a new table.
2. **JSONB `attributes`:** Car-specific fields (make, model, year) live in a flexible JSON column. Property fields (square footage, bedrooms, location) can use the same column with a different schema, avoiding expensive migrations.
3. **Decoupled pricing:** `listing_pricing` separates `base_rental_price` from contextual fees. The same tiered commission model applies regardless of whether the base price is a daily car rental or a monthly apartment lease.
4. **Polymorphic UI components:** Frontend components like `ListingCard` will render different layouts based on `listing.type`, enabling a unified browse experience across asset categories.
5. **Shared infrastructure:** Auth, profiles, admin intermediation, RLS policies, and storage buckets are asset-agnostic and will serve property listings without modification.
