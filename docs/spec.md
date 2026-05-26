# MyEthioProperties MVP Specification

## Goal
To build a **property-first** marketplace. The primary launch focus is verified property rentals and property sales. Car listings are retained as a secondary browse category but are not the marketing or homepage focus.

The platform operates with a centralized, concierge-style model where administrators intercept and intermediate all requests before owners see them. The platform charges a fixed commission on the base listing price only. All other associated fees are strictly exempt from commission.

## Launch Scope
**Primary:** Property rentals and property sales (apartments, houses, villas, land, commercial spaces).
**Secondary:** Car rentals (retained as a browse category at `/cars`, not promoted on the homepage).

## Users
1. **Property Owners:** Users who register on the platform and list their properties for rent or sale.
2. **Car Owners:** Users who register on the platform and list their vehicles for rent (secondary category).
3. **Renters / Buyers:** Users who browse available listings and submit requests.
4. **Admins:** Platform operators who manage all requests, act as the communication bridge between users and owners, and oversee transactions.

## MVP Scope
- User registration and authentication (Owners, Renters/Buyers, Admins).
- Property listing creation and management for owners (including itemized pricing: rent/sale price, security deposit).
- Car listing creation and management for owners (including itemized pricing: rental price, driver fee, delivery fee, security deposit).
- Listing gallery with 5 to 10 photos required per listing.
- Property and car browsing, searching, and filtering.
- Request submission system for renters/buyers.
- Admin dashboard to receive, view, and manage all requests.
- Admin workflow to update request statuses (e.g., Pending, Owner Contacted, Confirmed, Rejected).
- Fixed commission calculation on the base listing price only.
- Rating and review system for both renters/buyers and owners (after completed transactions).
- Multilingual support for English, Amharic, and Afaan Oromo.

## Out of Scope
- Direct in-app messaging or communication between owners and renters/buyers.
- Automated instant booking (all bookings require admin intermediation).
- Complex automated penalty or damage fee collection systems (handled manually/offline by admins for MVP).

## Core Flows
1. **Owner Onboarding & Listing:**
   - Owner signs up and completes profile registration.
   - Owner adds a new property or car listing, providing details, 5–10 photos, and itemized costs.
   - Admin reviews the listing before it becomes publicly visible.
2. **Renter/Buyer Request Flow:**
   - User browses available properties (or cars) on the platform.
   - User selects a listing, specifies desired dates or intent, and submits a request.
3. **Admin Intermediation Flow:**
   - Admin receives a notification of the new request.
   - Admin views the request and contacts the owner (via phone, email, or off-platform messaging) to confirm availability.
   - Admin negotiates or confirms details with the owner.
   - Admin updates the user regarding the request status and finalized details.
   - Owner sees the request only after admin review/contact.
4. **Financial Calculation:**
   - Platform automatically calculates commission on the **base listing price** only.
   - Only the base listing price is used. All other fees are clearly separated and tracked without commission applied.
5. **Rating & Review Flow:**
   - After a transaction reaches `completed` status, both the renter/buyer and the owner can rate each other.
   - Each party rates the other once per completed transaction (1–5 score + optional comment).
   - Aggregated ratings are displayed publicly on listings and owner profiles.

## Business Rules
- **Commission** applies only to the base listing price.
- **Commission must NOT apply to:** driver fee, delivery fee, security deposit, damage fee, late return penalty, or any other extra charge. These are 100% excluded from commission calculations.
- **Admin Intermediation:** All requests are strictly controlled by admins. Owners do not receive direct requests or see user details until the admin facilitates the connection. The owner sees the request only after admin review and contact.
- **Listing Review:** All listings require admin review before becoming publicly visible.
- **Photo Requirements:** Each listing must include 5 to 10 photos in the gallery.
- **Rating System:** Required for both renters/buyers and owners. Ratings unlock after a transaction is completed.
- **Launch Focus:** Property listings are the primary launch category. Car listings are a secondary browse category and are not promoted on the homepage or primary CTAs.
- **Design:** The platform follows the clean white/blue property marketplace design references.
- **Multilingual:** The platform must support English, Amharic, and Afaan Oromo.
- **Package Manager:** `pnpm` exclusively. No `npm`, `yarn`, or `bun`.

## Acceptance Criteria
- [ ] An owner can successfully register, log in, and list a property or car with separated pricing fields and 5–10 photos.
- [ ] A user can browse listings, view details, and successfully submit a request.
- [ ] Upon request submission, the request is routed exclusively to the admin dashboard. The owner does not receive an automated direct request.
- [ ] Owner sees the request only after admin has reviewed and contacted them.
- [ ] Admins can view a queue of all requests, see user and owner details, and update the status of the request.
- [ ] The system accurately calculates the platform commission on the base listing price, ignoring driver fees, delivery fees, security deposits, damage fees, late return penalties, and all other extra charges.
- [ ] After a transaction is completed, both the user and the owner can rate each other (1–5 score + optional comment).
- [ ] The homepage, metadata, navigation, and CTAs clearly position the platform as property-first.
