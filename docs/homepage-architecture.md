# Homepage Information Architecture

> **Status:** Active
> **Last updated:** 2026-05-21
> **Design system:** `docs/design-system.md`
> **Visual reference:** `docs/ui-reference.md`

## 1. Final Homepage Section Order

To maintain a clean, uncluttered, and scalable experience for a multi-asset marketplace (Cars + Properties), the homepage is structured as follows:

1. **Global Header** (Navigation & Authentication)
2. **Unified Hero Section** (Tabbed Search: Cars vs. Properties)
3. **Trust & Safety Banner** (Admin-reviewed, Verified Owners)
4. **Featured Properties** (Premium real estate listings)
5. **Featured Cars** (Premium vehicle listings)
6. **Browse by Category** (Consolidated or split tabs for Cars/Properties)
7. **How It Works** (Step-by-step generic flow)
8. **Pricing Transparency** (Commission breakdown)
9. **List With Us CTA** (Owner acquisition)
10. **Popular Locations** (Quick filter pills)
11. **Bottom CTA Banner** (Final push to browse/list)
12. **Global Footer** (Links & Contact)

---

## 2. Layout Plans

### 2.1 Desktop Layout Plan
- **Width:** Max container width `1280px` (`--container-max`), centered.
- **Hero:** Full-bleed background. Search box is a prominent floating card. Tabbed interface (Cars | Properties) switches the input fields smoothly.
- **Grids:**
  - Featured listings: 4 columns (`minmax(280px, 1fr)`).
  - Categories: 6 columns.
  - How it Works: 4 columns (numbered row with connectors).
- **Spacing:** Generous padding (`--space-16` / `64px`) between major sections to prevent overcrowding.

### 2.2 Mobile Layout Plan
- **Width:** 100% width with `16px` (`--space-4`) padding on sides.
- **Hero:** Stacked. Search box inputs take full width. Tabs (Cars/Properties) act as segmented controls.
- **Grids:** 
  - Featured listings: Single column stack, or horizontal swipeable carousel.
  - Categories: 2×3 grid or horizontal scroll.
  - How it Works: Vertical stack of 4 steps.
- **Navigation:** Collapsed into a hamburger menu.

---

## 3. Search Interface Architecture (Hero Section)

The core action is the Hero Search Box, structured with tabs:

### Tab 1: Cars
- **Transaction Type:** Rent / Buy (Toggle/Dropdown)
- **Driver Option:** With Driver / Without Driver (Dropdown, for Rent only)
- **Inputs:** Pick-up Location, Start Date, End Date
- **Action:** Primary `Search Cars` button

### Tab 2: Properties
- **Transaction Type:** Rent / Buy (Toggle/Dropdown)
- **Inputs:** 
  - Location / Area (Input)
  - Property Type (Dropdown: Villa, Apartment, Land, Commercial)
  - Bedrooms (Dropdown: Any, 1+, 2+, 3+, 4+)
  - Budget (Dropdown/Input: Min - Max)
- **Action:** Primary `Search Properties` button

---

## 4. Component Mapping

| Section | Planned Component Name | File Path (Proposed/Existing) |
|---|---|---|
| Header | `Header` | `src/components/layout/Header.tsx` |
| Hero & Search | `MarketplaceHeroSection` | `src/components/shared/MarketplaceHeroSection.tsx` |
| Trust Badges | `TrustBadgesSection` | `src/components/shared/TrustBadgesSection.tsx` |
| Featured Properties | `FeaturedPropertiesSection` | `src/components/properties/FeaturedPropertiesSection.tsx` |
| Featured Cars | `FeaturedCarsSection` | `src/components/cars/FeaturedCarsSection.tsx` |
| Categories | `CategoryBrowseSection` | `src/components/shared/CategoryBrowseSection.tsx` |
| How It Works | `HowItWorksSection` | `src/components/shared/HowItWorksSection.tsx` |
| Pricing | `PricingTransparencySection`| `src/components/shared/PricingTransparencySection.tsx` |
| Owner CTA | `OwnerCtaBanner` | `src/components/shared/OwnerCtaBanner.tsx` |
| Locations | `PopularLocationsSection` | `src/components/shared/PopularLocationsSection.tsx` |
| Bottom CTA | `BottomCtaBanner` | `src/components/shared/BottomCtaBanner.tsx` |
| Footer | `Footer` | `src/components/layout/Footer.tsx` |

---

## 5. Data Needed from Supabase

To render the homepage cleanly and fast, the following data must be fetched (ideally server-side and cached):

### 1. Featured Cars (Limit 4-8)
- **Query:** `listings` joined with `vehicle_details` and `rental_terms`.
- **Filters:** `status = 'published'`, `category = 'vehicle'`. Optionally filter by an `is_featured` flag or highest rating/recent additions.
- **Fields:** `id, title, location, listing_type`, `vehicle_details(make, model, year, transmission, fuel_type)`, `rental_terms(daily_price, ...)`

### 2. Featured Properties (Limit 4-8)
- **Query:** `listings` joined with `property_details` and `rental_terms` (if rent) or just listing price (if sale).
- **Filters:** `status = 'published'`, `category = 'property'`.
- **Fields:** `id, title, location, listing_type, price`, `property_details(bedrooms, bathrooms, area_sqm)`.

### 3. Categories (Metadata)
- **Cars:** Fetch from `vehicle_types` table (`id, name`).
- **Properties:** Fetch from `property_types` table (`id, name`).

### 4. Search Filter Data (Dropdown Options)
- Unique `location` strings from `listings` (to populate location typeahead/dropdowns).
