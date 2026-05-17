# ADR-0001: Rental-First Marketplace Architecture

**Status:** Accepted
**Date:** 2026-05-16
**Deciders:** Project team
**Last updated:** 2026-05-17

---

## Context

We are building a marketplace platform in the Ethiopian market that will eventually support four transaction types: car rentals, car sales, property rentals, and property sales. Before writing any code, we must lock down five foundational decisions that shape everything downstream — the product entry point, the data model philosophy, the transaction control model, the revenue mechanism, and the technology stack.

This ADR records those decisions, the reasoning behind each, and the tradeoffs we are knowingly accepting.

---

## Decision 1: Rental-First Instead of Sale-First

### Decision

Launch the MVP exclusively as a car rental marketplace. Car sales, property rentals, and property sales are deferred to future phases.

### Why

**Recurring revenue from day one.** A rental generates an ongoing relationship: the same car can be rented dozens of times per year, each time generating a commission event for the platform. A sale is a one-shot transaction — after the car changes hands, the platform's relationship with that asset ends permanently. For a bootstrapped marketplace that needs to demonstrate revenue traction early, rental's compounding transaction volume is fundamentally more attractive than sale's one-time payout.

**Lower barrier to entry for supply.** The hardest problem in any marketplace is the cold-start supply problem. Convincing an owner to _rent_ their car is a dramatically easier ask than convincing them to _sell_ it through an unproven platform. The owner retains their asset, assumes lower risk, and can withdraw from the platform at any time. This lowers the psychological and financial commitment required to onboard supply — critical for an early-stage marketplace with no brand recognition.

**Higher transaction frequency enables faster learning.** Each rental transaction is a data point: pricing sensitivity, popular vehicle types, geographic demand patterns, seasonal trends, pain points in the admin workflow. A rental-first model generates this feedback at 10–50× the rate of a sales model, letting us iterate on the product, pricing, and operations far more quickly.

**Trust builds incrementally.** Rentals are inherently lower-stakes than sales. A renter risking a few thousand Birr on a multi-day rental is more forgiving of platform imperfections than a buyer committing hundreds of thousands of Birr to a vehicle purchase. Short-term rentals let both owners and renters build confidence in the platform before we introduce the high-value, irreversible transactions that sales require.

**Simpler MVP scope.** Rentals involve date ranges, availability, and returns — a well-understood, bounded domain. Sales involve title transfers, vehicle inspections, escrow services, and legal compliance around ownership transfer. Each of these adds regulatory complexity, liability, and implementation cost that would balloon the MVP timeline without proportional learning.

### Tradeoffs

- We delay the potentially higher per-transaction revenue of sales commissions.
- Early adopters who specifically want to sell a vehicle will find no value in the platform until sales are added.
- Competitors who offer both rental and sales from launch may capture the sales segment first.

---

## Decision 2: Generic Listing Structure Instead of Car-Only Structure

### Decision

Use a single `listings` table with a `type` column (enum: `car`, future: `property_rental`, `property_sale`) and a JSONB `attributes` column for asset-specific fields, rather than creating dedicated `cars`, `properties`, etc. tables.

### Why

**Avoids a rewrite when expanding.** The product roadmap explicitly includes property rentals and property sales. If we build `cars` and `car_pricing` tables now, adding properties later means creating parallel `properties` and `property_pricing` tables, duplicating every RLS policy, duplicating storage logic, duplicating admin workflows, and maintaining two (eventually four) sets of everything. A generic `listings` model avoids this entirely — adding a new asset type is an enum value, a Zod validation schema, and a UI component variant.

**Shared infrastructure pays compound dividends.** Authentication, profiles, rental requests, admin intermediation workflows, commission logic, storage buckets, and RLS policies are all asset-agnostic. A generic listing model lets every future asset type inherit this entire infrastructure stack for free. The alternative — building asset-specific stacks — means every new asset type costs O(n) engineering effort instead of O(1).

**JSONB accommodates divergent schemas without migrations.** Car attributes (make, model, year, transmission, fuel type, seats, color) and property attributes (square footage, bedrooms, bathrooms, location, floor) have fundamentally different shapes. A relational approach would require schema migrations for each new attribute. JSONB accommodates both with zero schema changes while still supporting Postgres GIN indexes for query performance.

**Simpler codebase, simpler mental model.** One `ListingCard` component that renders differently based on `listing.type` is easier to maintain, test, and reason about than separate `CarCard` and `PropertyCard` components with duplicated logic. One `listings` API endpoint with type-aware validation is simpler than separate `/cars` and `/properties` endpoints.

### Tradeoffs

- JSONB attributes lack strict column-level database constraints. Validation must be enforced at the application layer via Zod schemas specific to each listing type. A malformed attribute blob that bypasses application validation could enter the database.
- Queries on JSONB fields are less ergonomic than queries on dedicated columns (`attributes->>'make'` vs. `make`). This is a DX cost, though GIN indexes mitigate any performance concerns.
- Reporting and analytics queries against JSONB are more complex than against flat columns.

---

## Decision 3: Admin-Controlled Request Flow Instead of Direct Owner Booking

### Decision

All rental requests pass through an admin intermediary. Owners never see incoming requests directly. Admins contact owners offline, negotiate availability, confirm details, and update request statuses manually. This is enforced at the database level via RLS — owners are blocked from `SELECT` on the `rental_requests` table entirely.

### Why

**Quality control on a new platform.** We are launching with no reputation system, no reviews, no transaction history. Allowing direct bookings on an unproven platform risks bad experiences at the worst possible time — when every early user's experience disproportionately shapes the platform's reputation. Admin intermediation lets the platform manually curate every single transaction during this critical period. Every rental that goes well is a controlled success; every potential failure is caught before it reaches the owner.

**Fraud prevention at the gatekeeping layer.** Admins can screen requests before involving owners: filtering out suspicious inquiries, verifying renter identity, and ensuring the request is legitimate. Without intermediation, owners receive unvetted requests and must make trust decisions on their own — a burden that will drive cautious owners off the platform.

**Pricing consistency and market intelligence.** During the early phase, admins can observe pricing across the entire marketplace — something no individual owner can do. Admins can verify that owners are not overcharging (driving renters away) or undercharging (undervaluing their assets and the platform's commission). This pricing oversight maintains platform-wide integrity and gives the team invaluable market data.

**Relationship building that automation cannot replicate.** In a market where digital trust is still developing, personal admin involvement builds relationships with both owners and renters. Each admin-facilitated transaction is an opportunity for qualitative feedback: why did the renter choose this car? What would the owner charge differently? These insights are invisible to automated systems and are essential for product development in the early phases.

**Simpler owner experience, higher retention.** Owners don't need to manage a request inbox, respond within deadlines, handle negotiation, or deal with no-shows. They receive a phone call from a trusted platform representative and confirm or decline. This dramatically lowers the operational burden of being an owner on the platform, increasing the likelihood that owners stay active.

### Tradeoffs

- **Does not scale.** Admin intermediation has a linear cost: every transaction requires human labor. As volume grows, this becomes a bottleneck. This is a known, intentional limitation of the MVP model.
- **Slower turnaround.** Renters accustomed to instant-booking competitors will experience delays. In the Ethiopian market, however, rental platforms with instant booking are not yet dominant, reducing this competitive pressure.
- **Higher operational cost.** Admin labor per transaction is a direct expense. This is acceptable at MVP scale and justified by the quality, fraud prevention, and learning benefits.

### Migration Path

When transaction volume justifies the operational cost of intermediation, the architecture supports a graceful transition:

1. The `rental_requests` RLS policies are relaxed to allow owners to `SELECT` their own requests.
2. Owner-facing UI is added to display incoming requests and allow direct acceptance.
3. The admin role shifts from mandatory intermediary to optional moderator — reviewing flagged requests, handling disputes, and monitoring quality.
4. The database schema requires zero changes. The migration is purely a policy and UI change.

---

## Decision 4: Tiered Commission Model on Base Rental Price Only

### Decision

The platform uses a tiered commission model calculated exclusively on the `base_rental_price`. All other fees — driver fees, delivery fees, security deposits, penalties, and damage fees — are fully excluded from commission calculations.

**Short-term rentals (1–30 days):** A flat fee determined by the listing's daily base rental price:

| Daily Base Rental Price | Platform Commission |
|---|---|
| ≤ 2,000 Birr/day | 300 Birr (flat) |
| 2,001–5,000 Birr/day | 600 Birr (flat) |
| > 5,000 Birr/day | 1,000 Birr (flat) |

**Long-term rentals (31+ days):** 8% of `base_rental_price × rental days`.

### Why

**Transparent and fair pricing builds owner trust.** The commission model is the single most important factor in owner acquisition and retention. Owners must understand exactly what the platform earns and feel that it is fair. Charging commission on security deposits (which are returned), damage fees (which are contingent), or driver fees (which pay a third party) would feel extractive and erode trust. A clean "we take X from the rental price, everything else is yours" message is simple, honest, and defensible.

**Competitive positioning in a nascent market.** Established international rental marketplaces charge 15–40% (Turo: 15–40%, Getaround: ~40%). Our rates — a flat 300–1,000 Birr for short-term or 8% for long-term — are dramatically lower. This aggressive pricing is a deliberate strategy to attract price-sensitive early supply (owners) in a market where platform rental is a new concept and owners need a compelling financial reason to participate.

**Tiered structure matches transaction economics.** Short-term rentals are low-value, high-frequency — a percentage-based commission on a 1-day rental would yield negligibly small amounts that aren't worth the accounting complexity. A flat fee is predictable for owners and ensures the platform earns a meaningful minimum per transaction. Long-term rentals are high-value — a flat fee would under-capture value on a 90-day rental at 5,000 Birr/day. A percentage ensures the platform earns proportionally as deal sizes grow.

**Flat fee tiers align platform and owner incentives.** The flat fee is determined by the daily rental price tier, not the rental duration. When an admin negotiates a higher rental price for the owner (moving from 1,800 to 2,200 Birr/day, for example), the platform also moves into a higher commission tier. Both parties benefit from higher pricing, eliminating adversarial dynamics.

**Exempting ancillary fees encourages honest price reporting.** If commission applied to all fees, owners would be financially incentivized to minimize the "base rental price" and inflate other fee categories to reduce commission exposure. By exempting ancillary fees entirely, owners have no reason to game the pricing breakdown. The price structure stays honest, which benefits renters and the platform's data integrity.

**Clean separation of concerns simplifies accounting.** Security deposits are held temporarily and returned — they are not revenue. Damage fees are contingent, unpredictable, and often disputed. Applying commission to these categories creates accounting ambiguity (commission on a refunded deposit? commission on a disputed damage fee?) that generates operational overhead and potential disputes. Excluding them keeps the financial model clean.

**Server-side enforcement prevents tampering.** The commission logic executes exclusively in Postgres (via trigger) or in a secure Next.js Server Action. It is never computed on the client. This ensures consistency, prevents manipulation, and maintains a single source of truth for financial calculations.

### Tradeoffs

- **Flat fees create a duration blind spot.** Within the 1–30 day short-term window, a 1-day rental and a 30-day rental at the same daily price produce identical commission. The platform captures no additional value from longer short-term rentals. This is acceptable because the simplicity and predictability of flat fees outweigh the marginal revenue loss.
- **Zero revenue from ancillary services.** Excluding driver fees, delivery fees, etc. means the platform earns nothing from potentially high-value add-on services. This can be revisited when those services are formalized into platform-managed features (e.g., a driver marketplace or delivery logistics system).
- **8% long-term rate may need recalibration.** At scale, 8% may prove too low to cover operational costs for long-term rentals that still require admin intermediation. This rate should be reviewed once long-term rental volume provides sufficient data.

---

## Decision 5: Supabase + Next.js Foundation

### Decision

Build the platform on Next.js (App Router) with Supabase as the backend-as-a-service (authentication, Postgres database, blob storage, Row Level Security). Use `pnpm` exclusively as the package manager.

### Why

#### Supabase

**Integrated authentication that flows into authorization.** Supabase Auth provides email/password (and future OAuth) authentication with JWTs that integrate directly into RLS policies. The same JWT that authenticates a user also drives their authorization — determining which rows they can read, write, and modify. There is no gap between "who is this user" and "what can this user access." In a platform where data isolation is a core business requirement (owners cannot see rental requests, renters cannot see other renters' data, only admins can modify request statuses), this tight auth→authz integration is not a convenience — it is a structural requirement.

**Row Level Security is the backbone of the business model.** The admin-controlled request flow (Decision 3) depends entirely on database-level access control. RLS policies enforce that owners are blocked from `SELECT` on `rental_requests`. This cannot be implemented reliably at the application layer — a missed middleware check, a misconfigured API route, or a direct database query would leak data. Supabase makes RLS a first-class citizen with direct policy management, ensuring that access control is enforced at the lowest possible layer regardless of how the data is accessed.

**Managed Postgres with full capability.** We need triggers (commission calculation on status change), functions (tiered commission logic), enums (listing types, request statuses), JSONB (generic listing attributes), and GIN indexes (querying JSONB). Supabase provides a full Postgres instance with all of these capabilities without requiring us to provision, patch, or manage database infrastructure.

**Built-in storage with policy-level access control.** Listing images and user avatars need storage with public read access and owner-only write access. Supabase Storage provides bucket-level and object-level policies that mirror the RLS model, eliminating the need for a separate CDN, S3 configuration, or custom upload authorization logic.

**Cost-effective at MVP scale.** The Supabase free tier covers early development and initial launch. Paid tiers are predictable and significantly cheaper than assembling equivalent services (managed Postgres + auth provider + blob storage + CDN) independently.

#### Next.js App Router

**Server Components keep sensitive logic off the client.** React Server Components (RSC) fetch data on the server and send rendered HTML to the client. Admin queries, commission calculations, and service-role operations never touch the client bundle. This is not just a performance optimization — it is a security boundary. The plan explicitly requires that the `SUPABASE_SERVICE_ROLE_KEY` never appears in client-side code, and RSCs enforce this structurally rather than relying on developer discipline.

**Server Actions provide a natural mutation boundary.** Form submissions, status updates, and admin operations execute on the server via Server Actions. This eliminates the need to build, secure, and maintain a separate REST or GraphQL API layer for mutations. Each Server Action is a self-contained, server-only function that can validate sessions, check roles, and execute privileged operations — exactly the pattern needed for admin status transitions and commission triggers.

**Middleware enables route-level access control.** Next.js middleware intercepts requests before rendering, enabling authentication checks, role-based redirects, and route protection at the edge. This complements RLS: middleware protects routes, RLS protects data. Both layers must be breached for unauthorized access, providing defense in depth.

**Full-stack in one repository.** Server-side logic, API routes, server actions, and the frontend coexist in a single Next.js project. There is no separate backend repository to deploy, version, or synchronize. For a small team building an MVP, this reduces operational overhead and eliminates an entire category of deployment coordination bugs.

#### pnpm

**Strict dependency resolution prevents phantom dependencies.** pnpm's non-flat `node_modules` structure means packages can only access dependencies they explicitly declare. This prevents the class of production bugs where code works locally because it accidentally relies on a transitive dependency that happens to be hoisted, then breaks in production when that transitive dependency changes.

**Disk efficiency for multi-project development.** pnpm's content-addressable storage deduplicates shared dependencies across projects. This matters on development machines running multiple Node.js projects simultaneously.

### Tradeoffs

- **Supabase vendor lock-in.** RLS policies, auth hooks, storage policies, and database triggers are Supabase-specific. Migrating to a self-hosted Postgres + custom auth stack would require significant effort. This is mitigated by Supabase being open-source and self-hostable — the migration path exists even if it is costly.
- **Next.js App Router complexity.** The Server Component / Client Component mental model has a genuine learning curve. The boundaries between server and client code are implicit and error-prone. Server Actions are still maturing. However, the security and performance benefits directly serve our architectural requirements (server-only commission logic, service-role key isolation) and outweigh the DX friction.
- **pnpm-only rule creates contributor friction.** Developers familiar only with npm or yarn must install pnpm. This is a minor, one-time friction point with meaningful reliability benefits.

---

## Summary

| # | Decision | Core Rationale |
|---|---|---|
| 1 | Rental-first | Recurring revenue, lower supply barrier, faster learning loops |
| 2 | Generic listings | Avoid rewrite on expansion, shared infrastructure, JSONB flexibility |
| 3 | Admin-controlled flow | Quality control, fraud prevention, relationship building on an unproven platform |
| 4 | Tiered commission | Transparent pricing, competitive rates, aligned incentives, clean accounting |
| 5 | Supabase + Next.js | RLS-driven security, server-only sensitive logic, full-stack in one repo |

Each decision is designed to be revisited as the platform matures. The rental-first focus expands to sales. The generic listing structure accommodates properties. The admin intermediation relaxes to direct booking. The commission tiers recalibrate with market data. The technology foundation scales with Supabase's paid tiers and Next.js's edge capabilities.
