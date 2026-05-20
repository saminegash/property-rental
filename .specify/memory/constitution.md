# Constitution

This document defines the non-negotiable rules, constraints, and principles that govern all implementation decisions in this project. Every piece of code, every migration, and every architectural choice must comply with these rules.

---

## Identity

**Project:** MyProperties Marketplace
**Market:** Ethiopia
**Stack:** Next.js App Router + Supabase (Auth, Postgres, Storage, RLS) + pnpm

---

## Immutable Rules

### 1. Platform Identity & Architecture

- **Property-First**: The main homepage (`/`) must be property-first, focusing on property sales and rentals.
- **Cars as Separate Module**: Cars must remain isolated as a separate module under `/cars`.
- **Generic Data Model**: The primary tables (`listings`) support multiple categories (`property`, `car`). Asset-specific attributes use JSONB or dedicated relation tables.

### 2. Design System & UI Direction

- **Unified White/Blue Theme**: The visual direction must strictly follow a clean white/blue UI.
- **Key UI Elements**:
  - Strong hero section
  - Large, prominent search box
  - Rounded cards with soft shadows
  - Verified and Featured badges for trust
  - Trust and safety sections
  - Mobile-first responsive layout
  - Professional, premium marketplace feel
- **Image Requirements**: All listings must require a 5–10 image gallery.

### 3. Business Logic

- **Commission**: The platform charges a fixed 5% commission on the base rental price only. Commission must NOT apply to driver fee, delivery fee, security deposit, damage fee, late return penalty, or any other extra charge. This logic executes server-side only.
- **Admin Intermediation**:
  - All listings require admin review before becoming public.
  - All rental/purchase requests pass through an admin intermediary.
  - Owners NEVER see incoming requests directly. Only admins can update request status.

### 4. Security & Environment

- **Service-Role Key Isolation**: 
  - `SUPABASE_SERVICE_ROLE_KEY` must NEVER be prefixed with `NEXT_PUBLIC_`.
  - It must NEVER appear in any client-side bundle or be imported from a `"use client"` module.
  - The service-role client must be guarded with `import "server-only"`.
- **Client-Safe Variables**: Only `NEXT_PUBLIC_` variables may be used in browser code.
- **Row Level Security (RLS)**: Enabled on every table. RLS is the primary access control mechanism.

### 5. Supabase Client Strategy

- Four client types, each for a specific context:
  1. **Browser client** (`"use client"`): anon key, RLS-bound, singleton.
  2. **Server Component client**: cookie-based session, RLS-bound.
  3. **Server Action client**: cookie-based session, RLS-bound.
  4. **Service Role client** (`import "server-only"`): bypasses RLS, admin operations only.

### 6. SEO & Localization

- **SEO Requirements**: Full technical SEO implementation is required (meta tags, sitemaps, semantic HTML, structured data).
- **Multilingual Support**: The platform must support English, Amharic, and Afaan Oromo.

### 7. Package Manager

- Use `pnpm` exclusively. No `npm`, no `yarn`, no `bun`.
