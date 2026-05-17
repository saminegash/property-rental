# Constitution

This document defines the non-negotiable rules, constraints, and principles that govern all implementation decisions in this project. Every piece of code, every migration, and every architectural choice must comply with these rules.

---

## Identity

**Project:** Car Rental Marketplace MVP
**Market:** Ethiopia (Ethiopian Birr currency)
**Stack:** Next.js App Router + Supabase (Auth, Postgres, Storage, RLS) + pnpm

---

## Immutable Rules

### 1. Package Manager

- Use `pnpm` exclusively. No `npm`, no `yarn`, no `bun`.
- `package-lock.json` and `yarn.lock` must never exist in this repository.

### 2. Service-Role Key Isolation

- `SUPABASE_SERVICE_ROLE_KEY` must NEVER be prefixed with `NEXT_PUBLIC_`.
- `SUPABASE_SERVICE_ROLE_KEY` must NEVER appear in any client-side bundle.
- `SUPABASE_SERVICE_ROLE_KEY` must NEVER be imported from a `"use client"` module.
- The service-role client must be guarded with `import "server-only"`.

### 3. Client-Safe Variables

- Only variables prefixed with `NEXT_PUBLIC_` may be used in browser code.
- Client-safe variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- All client-side Supabase clients use the anon key and are RLS-bound.

### 4. Row Level Security (RLS)

- RLS is enabled on every table. No exceptions.
- RLS is the primary access control mechanism — not application-layer checks.
- Application-layer authorization (middleware, Server Actions) is defense-in-depth, not the primary gate.

### 5. Admin Intermediation

- All rental requests pass through an admin intermediary.
- Owners NEVER see incoming rental requests directly.
- RLS enforces this: owners are blocked from `SELECT` on `rental_requests`.
- Only admins can `UPDATE` request status.

### 6. Commission Rules

- Commission is calculated on `base_rental_price` only.
- Driver fees, delivery fees, security deposits, penalties, and damage fees are 100% excluded.
- Short-term (1–30 days): flat fee based on daily base rental price:
  - ≤ 2,000 Birr/day → 300 Birr
  - 2,001–5,000 Birr/day → 600 Birr
  - > 5,000 Birr/day → 1,000 Birr
- Long-term (31+ days): 8% of `base_rental_price × rental days`.
- Commission logic executes server-side only (Postgres trigger or Server Action). Never on the client.

### 7. Generic Data Model

- The primary table is `listings`, not `cars`.
- The `type` column (enum) distinguishes asset categories: `car`, future `property_rental`, `property_sale`.
- Asset-specific attributes use a JSONB `attributes` column.
- Application-layer validation (Zod schemas per listing type) enforces attribute structure.
- New asset types must not require schema rewrites.

### 8. Environment Validation

- All required environment variables are validated with Zod.
- Validation is deferred (not top-level) — it runs on first access, not at import time.
- Missing variables produce descriptive errors, not cryptic crashes.

### 9. Supabase Client Strategy

- Four client types, each for a specific context:
  1. **Browser client** (`"use client"`): anon key, RLS-bound, singleton.
  2. **Server Component client**: cookie-based session, RLS-bound.
  3. **Server Action client**: cookie-based session, RLS-bound.
  4. **Service Role client** (`import "server-only"`): bypasses RLS, admin operations only.
- Each client is instantiated from its own dedicated file under `src/lib/supabase/`.

### 10. Sensitive Logic Placement

- Commission calculations → server only.
- Admin status transitions → server only.
- Role checks for protected operations → server only (Server Actions or API routes).
- Data fetching for admin views → Server Components (RSC) only.

### 11. Role Defaults

- New users default to `renter`.
- Admin promotion is manual (SQL) during MVP.
- Role is stored in the `profiles` table, not in Supabase Auth metadata.

### 12. Pricing Separation

- `base_rental_price` is always stored and displayed separately from ancillary fees.
- Ancillary fees (driver, delivery, deposit) are tracked but never feed into commission.
- This separation must be maintained in the database, API responses, and UI.

---

## File Placement Conventions

```
src/
├── app/                    # Next.js App Router pages and layouts
│   ├── (auth)/             # Auth pages (login, signup) — no dashboard shell
│   ├── dashboard/          # Role-based dashboards
│   │   ├── admin/
│   │   ├── owner/
│   │   └── renter/
│   └── listings/           # Public listing pages
├── components/             # Reusable React components
│   ├── ui/                 # Primitives (Button, Input, Card, etc.)
│   └── listings/           # Listing-specific components
├── lib/
│   ├── env/                # Environment validation (client.ts, server.ts)
│   └── supabase/           # Supabase client factories
│       ├── client.ts       # Browser client ("use client")
│       ├── server.ts       # Server Component client (cookies)
│       ├── action.ts       # Server Action client (cookies)
│       └── admin.ts        # Service Role client ("server-only")
└── types/                  # TypeScript type definitions
    └── database.ts         # Supabase-generated types
```

---

## Sources of Truth

| Document | Purpose |
|---|---|
| `docs/spec.md` | Product specification — what we build |
| `docs/plan.md` | Implementation plan — how we build it |
| `docs/tasks.md` | Task groups — execution order |
| `docs/adr/` | Architecture Decision Records — why we made key choices |
| `docs/checkpoints/` | Checkpoint definitions — what each milestone delivers |
| `.specify/memory/constitution.md` | This file — non-negotiable rules |
