# ADR-0001: Rental-First Marketplace Architecture

**Status:** Accepted  
**Date:** 2026-05-16  
**Deciders:** Project team  

---

## Context

We are building a marketplace platform that will eventually support car rentals, car sales, property rentals, and property sales. We need to decide on the product entry point, data architecture, transaction control model, revenue model, and technology foundation before writing any code.

---

## Decision 1: Rental-First Instead of Sale-First

### Decision
Launch the MVP as a rental marketplace. Car sales, property rentals, and property sales are deferred to future phases.

### Why
- **Recurring revenue from day one.** Rentals generate ongoing transactions that the platform can commission repeatedly. A single sale produces one commission event and then the relationship ends.
- **Lower barrier to entry for supply.** Owners keep their asset and earn passive income. Convincing someone to list a car for rent is significantly easier than convincing them to sell it through an unproven platform.
- **Higher transaction frequency.** A single car can generate dozens of rental transactions per year, giving the platform more data, more revenue opportunities, and faster feedback loops for product improvement.
- **Trust builds incrementally.** Short-term rentals let both owners and renters build confidence in the platform before committing to high-value, irreversible transactions like sales.
- **Simpler MVP scope.** Rentals involve date ranges, availability, and returns — a well-understood domain. Sales involve title transfers, inspections, escrow, and legal compliance that would dramatically increase MVP complexity.

### Tradeoffs
- We delay the potentially higher per-transaction revenue of sales.
- Some early users who want to sell will have to wait.

---

## Decision 2: Generic Listing Structure Instead of Car-Only Structure

### Decision
Use a single `listings` table with a `type` column (enum: `car`, future: `property_rental`, `property_sale`) and a JSONB `attributes` column for asset-specific fields, rather than creating dedicated `cars`, `properties`, etc. tables.

### Why
- **Avoids a rewrite when expanding.** If we build `cars` and `car_pricing` tables now, adding property support later means creating parallel tables, duplicating RLS policies, duplicating storage logic, and maintaining two sets of everything. A generic structure avoids this entirely.
- **Shared infrastructure.** Auth, profiles, rental requests, admin workflows, commission logic, storage buckets, and RLS policies work identically regardless of asset type. A generic listing model lets all asset types inherit this infrastructure.
- **JSONB flexibility.** Car attributes (make, model, year, transmission) and property attributes (square footage, bedrooms, location) have different shapes. JSONB accommodates both without schema migrations, while still allowing Postgres indexing (`GIN` indexes) for query performance.
- **Simpler codebase.** One `ListingCard` component that renders differently based on `listing.type` is easier to maintain than separate `CarCard` and `PropertyCard` components with duplicated logic.

### Tradeoffs
- JSONB attributes lack strict column-level database constraints. Validation must be enforced at the application layer (Zod schemas per listing type).
- Queries on JSONB fields are slightly less ergonomic than queries on dedicated columns, though GIN indexes mitigate performance concerns.

---

## Decision 3: Admin-Controlled Request Flow Instead of Direct Owner Booking

### Decision
All rental requests pass through an admin intermediary. Owners never see incoming requests directly. Admins contact owners offline, negotiate availability, and update request statuses manually.

### Why
- **Quality control on a new platform.** As an early-stage marketplace with no reputation system, allowing direct bookings risks bad experiences (unresponsive owners, misrepresented cars, pricing disputes). Admin intermediation lets the platform manually curate every transaction until trust mechanisms are in place.
- **Fraud prevention.** Admins can screen requests before involving owners, filtering out suspicious or low-quality inquiries that could waste owner time and damage platform credibility.
- **Pricing consistency.** Admins can verify that owners are not overcharging or undercharging relative to market rates, maintaining platform-wide pricing integrity during the early growth phase.
- **Relationship building.** In the early days, personal admin involvement builds relationships with both owners and renters, increasing retention and generating qualitative feedback that automated systems cannot capture.
- **Simpler owner experience.** Owners don't need to manage a request inbox, respond within deadlines, or handle negotiation. They receive a phone call from the platform and confirm or decline. This dramatically lowers the friction of being an owner on the platform.

### Tradeoffs
- Admin intermediation does not scale. As transaction volume grows, this will become a bottleneck and will need to transition to direct booking with optional admin oversight.
- Slower turnaround time for renters compared to instant-booking competitors.
- Higher operational cost (admin labor per transaction).

### Migration Path
When volume justifies it, the `rental_requests` RLS policies can be relaxed to allow owners to `SELECT` their own requests, and the admin role shifts from mandatory intermediary to optional moderator.

---

## Decision 4: 5% Commission on Rental Price Only

### Decision
The platform charges a 5% commission calculated exclusively on the `base_rental_price × rental days`. Driver fees, delivery fees, security deposits, penalties, and damage fees are fully excluded from the commission calculation.

### Why
- **Transparent and fair pricing.** Owners and renters can clearly understand what the platform earns. Charging commission on deposits or damage fees would feel punitive and erode trust.
- **Competitive rate.** 5% is significantly lower than established rental marketplaces (Turo charges 15–40%, Getaround charges 40%). This attracts early supply (owners) who are price-sensitive about platform fees.
- **Encourages accurate fee reporting.** If commission applied to all fees, owners would be incentivized to inflate the "base price" and minimize other fees, distorting the pricing structure. By exempting ancillary fees, owners have no reason to game the breakdown.
- **Clean separation of concerns.** Security deposits are held temporarily and returned. Damage fees are contingent and unpredictable. Applying commission to these creates accounting complexity and potential disputes. Excluding them keeps the financial model simple.
- **Server-side enforcement.** The commission formula runs exclusively in Postgres (trigger) or a secure Server Action, never on the client. This prevents tampering and ensures consistency.

### Tradeoffs
- 5% may be too low to sustain operations at small scale. The rate can be adjusted later as the platform proves its value.
- Excluding ancillary fees means the platform earns nothing from high-value add-on services (premium drivers, long-distance delivery). This can be revisited when those services are formalized.

---

## Decision 5: Supabase + Next.js Foundation

### Decision
Build the platform on Next.js (App Router) with Supabase as the backend-as-a-service (auth, Postgres, storage, RLS). Use `pnpm` as the sole package manager.

### Why

**Supabase:**
- **Integrated auth.** Supabase Auth provides email/password (and future OAuth) with JWTs that integrate directly into RLS policies. No need to build or maintain a custom auth system.
- **Row Level Security.** RLS is the backbone of our security model. The admin-controlled request flow, owner data isolation, and renter privacy all depend on database-level access control. Supabase makes RLS a first-class citizen with direct policy management.
- **Managed Postgres.** We get a full Postgres instance with triggers, functions, enums, JSONB, and GIN indexes — everything needed for the generic listing architecture and commission calculations — without managing infrastructure.
- **Built-in storage.** Supabase Storage with bucket-level and object-level policies handles listing images and avatars without a separate CDN or S3 setup.
- **Cost-effective at MVP scale.** The free tier covers early development. Paid tiers are predictable and significantly cheaper than assembling equivalent services independently.

**Next.js App Router:**
- **Server Components by default.** Data fetching in RSCs means sensitive queries (admin data, commission calculations) never touch the client. This aligns directly with the rule that the service-role key must never be exposed.
- **Server Actions for mutations.** Form submissions and status updates execute on the server, providing a natural boundary for admin-only operations without building a separate API layer.
- **Middleware for auth.** Next.js middleware intercepts requests before rendering, enabling route protection and role-based redirects at the edge.
- **Full-stack in one project.** No separate backend repository to maintain. Server-side logic, API routes, and the frontend live together, simplifying deployment and development workflow.

**pnpm:**
- **Strict dependency resolution.** pnpm's non-flat `node_modules` structure prevents phantom dependencies, reducing the risk of production bugs from accidentally relying on transitive packages.
- **Disk efficiency.** Content-addressable storage means shared dependencies across projects are stored once, which matters for development machines with multiple projects.

### Tradeoffs
- **Supabase vendor lock-in.** RLS policies, auth, and storage are Supabase-specific. Migrating to a self-hosted Postgres + custom auth would require significant effort. Mitigated by Supabase being open-source and self-hostable.
- **Next.js complexity.** The App Router's Server Component / Client Component mental model has a learning curve. Server Actions are still maturing. However, the security and performance benefits outweigh the DX friction.
- **pnpm-only rule.** Contributors familiar only with npm or yarn will need to install pnpm. This is a minor friction point with significant reliability benefits.
