# Car Rental Marketplace MVP Specification

## Goal
To build a rental-first marketplace where car owners can list their vehicles and renters can request them. The platform operates with a centralized, concierge-style model where administrators intercept and intermediate all rental requests before owners see them. The platform charges a fixed 5% commission on the base rental price only. All other associated fees are strictly exempt from commission.

## Users
1. **Car Owners:** Users who register on the platform and list their cars for rent.
2. **Renters:** Users who browse available cars and submit rental requests.
3. **Admins:** Platform operators who manage rental requests, act as the communication bridge between renters and owners, and oversee transactions.

## MVP Scope
- User registration and authentication (Owners, Renters, Admins).
- Car listing creation and management for owners (including itemized pricing: rental price, driver fee, delivery fee, security deposit).
- Listing gallery with 5 to 10 photos required per listing.
- Car browsing, searching, and filtering for renters.
- Rental request submission system for renters.
- Admin dashboard to receive, view, and manage all rental requests.
- Admin workflow to update request statuses (e.g., Pending, Owner Contacted, Confirmed, Rejected).
- Fixed 5% commission calculation on the base rental price only.
- Rating and review system for both renters and owners (after completed rentals).
- Basic database architecture designed with future extensibility in mind (to support future property rentals and property sales).
- Multilingual support for English, Amharic, and Afaan Oromo.

## Out of Scope
- Direct in-app messaging or communication between owners and renters.
- Automated instant booking (all bookings require admin intermediation).
- Car sales (planned for future phases).
- Property rentals and sales (planned for future phases).
- Complex automated penalty or damage fee collection systems (handled manually/offline by admins for MVP).

## Core Flows
1. **Owner Onboarding & Listing:**
   - Owner signs up and completes profile registration.
   - Owner adds a new car listing, providing details, 5–10 photos, and itemized costs (rental price, driver fee, delivery fee, deposit).
   - Admin reviews the listing before it becomes publicly visible.
2. **Renter Request Flow:**
   - Renter browses available cars on the platform.
   - Renter selects a car, specifies desired dates, and submits a rental request.
3. **Admin Intermediation Flow:**
   - Admin receives a notification of the new rental request.
   - Admin views the request and contacts the car owner (via phone, email, or off-platform messaging) to confirm car availability.
   - Admin negotiates or confirms details with the owner.
   - Admin updates the renter regarding the request status and finalized details.
   - Owner sees the request only after admin review/contact.
4. **Financial Calculation:**
   - Platform automatically calculates commission as **5% of the base rental price** (base_rental_price × rental_days × 0.05).
   - Only the base rental price is used. All other fees are clearly separated and tracked without commission applied.
5. **Rating & Review Flow:**
   - After a rental reaches `completed` status, both the renter and the owner can rate each other.
   - Each party rates the other once per completed rental (1–5 score + optional comment).
   - Aggregated ratings are displayed publicly on listings and owner profiles.

## Business Rules
- **Commission is fixed at 5%.** The commission applies only to the base rental price (daily_price × rental_days × 0.05).
- **Commission must NOT apply to:** driver fee, delivery fee, security deposit, damage fee, late return penalty, or any other extra charge. These are 100% excluded from commission calculations.
- **Admin Intermediation:** All rental requests are strictly controlled by admins. Car owners do not receive direct requests or see renter details until the admin facilitates the connection. The owner sees the request only after admin review and contact.
- **Listing Review:** All listings require admin review before becoming publicly visible.
- **Photo Requirements:** Each listing must include 5 to 10 photos in the gallery.
- **Rating System:** Required for both renters and owners. Ratings unlock after a rental is completed.
- **Current Focus:** Car listings only. No property listings are implemented yet.
- **Future Expansion:** The platform architecture must support property rentals and property sales without requiring a database rewrite.
- **Design:** The platform follows the uploaded clean white/blue car marketplace and property marketplace design references.
- **Multilingual:** The platform must support English, Amharic, and Afaan Oromo.
- **Package Manager:** `pnpm` exclusively. No `npm`, `yarn`, or `bun`.

## Acceptance Criteria
- [ ] An owner can successfully register, log in, and list a car with separated pricing fields (rental price vs. other fees) and 5–10 photos.
- [ ] A renter can browse listings, view details, and successfully submit a rental request for specific dates.
- [ ] Upon request submission, the request is routed exclusively to the admin dashboard. The owner does not receive an automated direct request.
- [ ] Owner sees the request only after admin has reviewed and contacted them.
- [ ] Admins can view a queue of all rental requests, see renter and owner details, and update the status of the request.
- [ ] The system accurately calculates the platform commission as 5% of (base_rental_price × rental_days), ignoring driver fees, delivery fees, security deposits, damage fees, late return penalties, and all other extra charges.
- [ ] After a rental is completed, both the renter and the owner can rate each other (1–5 score + optional comment).
- [ ] The underlying data models are structured generically enough (e.g., `Listing`, `ListingType`) to support future property rental and sale categories.
