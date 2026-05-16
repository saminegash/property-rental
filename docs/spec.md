# Car Rental Marketplace MVP Specification

## Goal
To build a rental-first marketplace where car owners can list their vehicles and renters can request them. The platform operates with a centralized, concierge-style model where administrators intercept and intermediate all rental requests before owners see them. The platform uses a tiered commission model on the base rental price only: a flat fee (300–1,000 Birr) for short-term rentals (1–30 days) scaled by daily rental price, and 8% for long-term rentals (31+ days). All other associated fees are exempt from commission.

## Users
1. **Car Owners:** Users who register on the platform and list their cars for rent.
2. **Renters:** Users who browse available cars and submit rental requests.
3. **Admins:** Platform operators who manage rental requests, act as the communication bridge between renters and owners, and oversee transactions.

## MVP Scope
- User registration and authentication (Owners, Renters, Admins).
- Car listing creation and management for owners (including itemized pricing: rental price, driver fee, delivery fee, security deposit).
- Car browsing, searching, and filtering for renters.
- Rental request submission system for renters.
- Admin dashboard to receive, view, and manage all rental requests.
- Admin workflow to update request statuses (e.g., Pending, Owner Contacted, Confirmed, Rejected).
- Tiered commission calculation engine (flat 300–1,000 Birr for short-term, 8% for long-term, on the base rental price only).
- Basic database architecture designed with future extensibility in mind (to support future sales and property listings).

## Out of Scope
- Direct in-app messaging or communication between owners and renters.
- Automated instant booking (all bookings require admin intermediation).
- Car sales (planned for future phases).
- Property rentals and sales (planned for future phases).
- Complex automated penalty or damage fee collection systems (handled manually/offline by admins for MVP).
- Rating and review systems.

## Core Flows
1. **Owner Onboarding & Listing:**
   - Owner signs up and completes profile registration.
   - Owner adds a new car listing, providing details, photos, and itemized costs (rental price, driver fee, delivery fee, deposit).
2. **Renter Request Flow:**
   - Renter browses available cars on the platform.
   - Renter selects a car, specifies desired dates, and submits a rental request.
3. **Admin Intermediation Flow:**
   - Admin receives a notification of the new rental request.
   - Admin views the request and contacts the car owner (via phone, email, or off-platform messaging) to confirm car availability.
   - Admin negotiates or confirms details with the owner.
   - Admin updates the renter regarding the request status and finalized details.
4. **Financial Calculation:**
   - Platform automatically determines the commission type based on rental duration:
     - **Short-term (1–30 days):** Flat fee of 300–1,000 Birr, scaled by the listing's daily base rental price.
     - **Long-term (31+ days):** 8% of `base_rental_price × rental days`.
   - Only the base rental price is used. Other fees are clearly separated and tracked without commission applied.

## Business Rules
- **Admin Intermediation:** All rental requests are strictly controlled by admins. Car owners do not receive direct requests or see renter details until the admin facilitates the connection.
- **Commission Structure:** The platform uses a tiered commission model based on rental duration:
  - **Short-term (1–30 days):** A flat fee between 300–1,000 Birr, determined by the listing's daily base rental price (higher price → higher flat fee).
  - **Long-term (31+ days):** 8% of `base_rental_price × rental days`.
- **Exempt Fees:** Driver fees, delivery fees, security deposits, penalties, and damage fees are 100% excluded from platform commission calculations.
- **Future-Proofing:** The platform's foundational architecture (database schema, models) must be designed to eventually support car sales, property rentals, and property sales without requiring a complete rewrite.

## Acceptance Criteria
- [ ] An owner can successfully register, log in, and list a car with separated pricing fields (rental price vs. other fees).
- [ ] A renter can browse listings, view details, and successfully submit a rental request for specific dates.
- [ ] Upon request submission, the request is routed exclusively to the admin dashboard. The owner does not receive an automated direct request.
- [ ] Admins can view a queue of all rental requests, see renter and owner details, and update the status of the request.
- [ ] The system accurately calculates the platform fee using the tiered model: flat 300–1,000 Birr for short-term rentals (1–30 days) based on daily price, or 8% of base rental price for long-term rentals (31+ days), ignoring driver fees, delivery fees, and security deposits.
- [ ] The underlying data models are structured generically enough (e.g., `Listing`, `ListingType`) to support future non-car rental categories.
