# UI Reference — MyProperties Marketplace

> **Status:** Active
> **Last updated:** 2026-05-19
> **Design system:** `docs/design-system.md`
> **Visual source:** Uploaded homepage screenshot (official reference)
> **Current scope:** Cars only. Layout must remain flexible for property marketplace later.

---

## 1. Page Map

| Page | Route | Status | Description |
|---|---|---|---|
| Homepage | `/` | 🔵 To build | Full marketing landing with hero, search, featured cars, categories, trust badges, pricing, CTA |
| Browse Cars | `/cars` | 🟡 Exists (dark theme) | Grid of active listings with search + filters |
| Car Detail | `/cars/[id]` | 🟡 Exists (dark theme) | Full gallery, attributes, pricing breakdown, rental request CTA |
| Login | `/login` | 🟡 Exists (dark theme) | Email/password auth |
| Sign Up | `/signup` | 🟡 Exists (dark theme) | Registration with role selection |
| Safety | `/safety` | 🟡 Exists (dark theme) | Marketplace rules and guidelines |
| Owner Dashboard | `/dashboard/owner` | 🟡 Exists (dark theme) | Listing management, confirmed rentals |
| Renter Dashboard | `/dashboard/renter` | 🟡 Exists (dark theme) | Request history, status tracking |
| Admin Dashboard | `/dashboard/admin` | 🟡 Exists (dark theme) | Request queue, status transitions |

> All existing pages need theme migration from dark to the new white/blue design system.

---

## 2. Homepage Layout (Primary Reference)

The homepage is the single most important page. It follows a vertical section-based layout with clear visual hierarchy. All sections below are derived from the uploaded screenshot.

### 2.1 Global Header (Sticky)

```
┌─────────────────────────────────────────────────────────────────┐
│ 🔵 MyProperties  │  Browse Cars  How It Works  List Your Car   │
│   tagline         │  Safety  Help  │  EN ▾  🌙  Login  Register│
└─────────────────────────────────────────────────────────────────┘
```

- **Position:** Sticky top, white background, subtle bottom border
- **Logo:** Blue icon + "MyProperties" text + muted tagline
- **Nav links:** Browse Cars, How It Works, List Your Car, Safety, Help
- **Right side:** Language switcher (EN ▾), dark mode toggle (future), Login button (text), Register button (primary blue pill)
- **Mobile:** Hamburger menu, logo + register button visible

### 2.2 Hero Section

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Rent verified cars              ┌──────────────────────┐       │
│  with or without a driver        │ ✅ Verified Owner    │       │
│                                  │                      │       │
│  Find trusted cars, request      │  [Car Image]         │       │
│  rentals, and get your car       │                      │       │
│  delivered within hours or days. │  Toyota RAV4 2020    │       │
│                                  │  📍 Bole, Addis Ababa│       │
│  ┌──────────────────────────┐    │                      │       │
│  │ Pick-up  Start   End     │    │  3,500 ETB/day       │       │
│  │ location date    date    │    │  Driver fee  +1,500  │       │
│  │ Driver option            │    │  Deposit     15,000  │       │
│  │        [🔍 Search Cars]  │    │  Delivery    500     │       │
│  └──────────────────────────┘    └──────────────────────┘       │
│                                                                 │
│  👥👥👥 Join 2,000+ happy renters    How it works 🔵            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Left column:**
- Headline: "Rent verified cars with or **without** a driver" — bold emphasis on "without"
- Subtext paragraph
- **Search box** (white card, rounded corners, light shadow):
  - Row 1: Pick-up location (input), Start date (date picker), End date (date picker)
  - Row 2: Driver option (select dropdown)
  - Search button: Primary blue, full or partial width, "🔍 Search Cars"
- Social proof: Overlapping avatar circles + "Join 2,000+ happy renters"
- "How it works" link with blue arrow

**Right column (desktop only):**
- Featured car card with:
  - "✅ Verified Owner" badge (top)
  - Heart/favorite icon (top right)
  - Car photo (large, rounded)
  - Car name + location
  - Price breakdown: base price/day, driver fee, security deposit, delivery fee

**Background:** Light blue gradient or `--color-primary-surface`
**Mobile:** Single column — headline, search box, social proof. Featured card hidden or below.

### 2.3 Trust Badges Row

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ ✅        │  │ 🛡️        │  │ 🚗        │  │ 💰        │
│ Verified  │  │ Admin     │  │ With or   │  │ Transparent│
│ Owners    │  │ Reviewed  │  │ Without   │  │ Pricing    │
│           │  │           │  │ Driver    │  │            │
│ All owners│  │ Every     │  │ Choose    │  │ Clear price│
│ verified  │  │ listing   │  │ the option│  │ breakdown &│
│ for safety│  │ checked   │  │ that fits │  │ 5% commis- │
│           │  │ by admin  │  │ your trip │  │ sion only  │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

- 4 cards in a row (desktop), 2×2 (tablet), stack (mobile)
- Each: Icon (48px, muted blue) + bold title + short description
- White background, subtle border, no shadow
- Reinforces key value propositions

### 2.4 Featured Cars Section

```
Featured Cars                                    View all cars →
Top rated and most trusted cars, ready for you.

┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ [Image]  │  │ [Image]  │  │ [Image]  │  │ [Image]  │
│ 🔵 W/Drv │  │ 🔵 W/O   │  │ 🔵 W/Drv │  │          │
│ 🟢 Deliv │  │ 🟢 Deliv │  │ 🟢 Deliv │  │ 🔵 W/O   │
│ ♡        │  │ ♡        │  │ ♡        │  │ ♡        │
│          │  │          │  │          │  │          │
│ Toyota   │  │ Hyundai  │  │ Toyota   │  │ Kia Rio  │
│ Corolla  │  │ Tucson   │  │ Land     │  │ 2017     │
│ 2018     │  │ 2021     │  │ Cruiser  │  │          │
│ Kazanch..│  │ Bole, AA │  │ 2016     │  │ Megenag..│
│          │  │          │  │ CMC, AA  │  │          │
│ 🚗 F/day │  │          │  │          │  │          │
│ 3,000/day│  │ 4,500/day│  │ 7,500/day│  │ 2,200/day│
│          │  │          │  │          │  │          │
│ ⭐ 4.8(32)│  │ ⭐ 4.9(28)│  │ ⭐ 4.9(19)│  │ ⭐ 4.7(21)│
│[Req Now] │  │[Req Now] │  │[Req Now] │  │[Req Now] │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

**Listing Card Anatomy:**
1. **Image area** (aspect 4:3, rounded top corners)
   - Badge pills overlay (top-left): "With Driver" (blue), "Without Driver" (gray), "Delivery" (green)
   - Heart/favorite icon (top-right)
   - "Verified Owner" small badge if applicable
2. **Content area** (padded below image)
   - Car name (bold, 16px)
   - Location with pin icon (muted text, 13px)
   - Price row: car icon + base fee label + "ETB/day" price (bold blue or dark)
   - Additional fees row: small muted text showing driver fee, deposit
   - Rating: star icon + score + review count
   - "Request Now" button (primary outline or text link)

**Layout:** Horizontal scrollable carousel (desktop 4 visible), with left/right arrows. 2 columns on tablet, 1 on mobile.

### 2.5 Browse by Category

```
Browse by Category

┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│  🚗     │ │  🚙     │ │  ✨     │ │  👨‍✈️     │ │  🔑     │ │  🚚     │
│ Economy │ │  SUVs   │ │ Luxury  │ │  With   │ │ Without │ │Delivery │
│  Cars   │ │         │ │  Cars   │ │ Driver  │ │ Driver  │ │Available│
│         │ │ Spacious│ │ Premium │ │ Profess-│ │ Drive   │ │ We bring│
│Affordab-│ │ & comfy │ │ & styl- │ │ ional   │ │ yourself│ │ the car │
│le & eff-│ │         │ │ ish     │ │ driver  │ │ freely  │ │ to you  │
│icient  │ │         │ │ rides   │ │ included│ │         │ │         │
└─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘
```

- 6 category cards in a row (desktop), wrap on smaller screens
- Each: Illustrative icon (48px) + category name (bold) + short description (muted)
- White background, subtle border, slight hover lift
- Clicking filters the browse page

### 2.6 How It Works

```
How It Works

1 Choose a car       2 Send rental      3 Admin confirms    4 Receive the
  🔍                   request 📋         with owner 🛡️       car 🚗
  Browse available     Submit your        Our admin team      Pick up or get
  cars and select      request with       verifies and        delivery and
  the one you like.    dates, driver      confirms with       enjoy your trip.
                       option & details.  the owner.
```

- 4 numbered steps, horizontal row (desktop), vertical stack (mobile)
- Each step: Circled number (blue) + icon + title (bold) + description
- Clean connector line or arrow between steps (desktop only)
- Reinforces the admin-intermediated flow

### 2.7 Pricing Transparency Section

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  We believe in                                                  │
│  pricing transparency     💰 Car Rental  💰 Driver    💰 Security│
│                              Price         Fee          Deposit │
│  Everything is shown         3,000/day     +1,500/day   15,000  │
│  clearly before you          Base price    If you need  Refund- │
│  send your request.          for the car   a driver     able    │
│                                                                 │
│  ✅ Commission is 5%      💰 Delivery   💰 Platform               │
│     of rental price only     Fee          Commission             │
│                              500 ETB      5%                     │
│                              If delivery  Of rental              │
│                              is needed    price only             │
│                                                                 │
│  ⚠️ Driver fee, delivery fee, security deposit, damage fees,    │
│     and penalties are not included in commission.                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

> **Note:** The screenshot shows "5% commission" as simplified marketing copy. The actual implementation uses the tiered model defined in `spec.md` (flat 300–1,000 Birr for short-term, 8% for long-term). The UI copy should be updated to reflect the tiered model accurately or use a simplified summary that links to full pricing details.

- Light gray/blue background section
- Left side: Heading + description + commission callout with checkmark
- Right side: 5 pricing cards in a grid showing each fee type with example values
- Footer disclaimer about excluded fees

### 2.8 List Your Car CTA Banner

```
┌─────────────────────────────────────────────────────────────────┐
│  [Car Image]    Own a car? Start earning from it.               │
│                                                                 │
│                 List your car, set your rental price, choose    │
│                 with-driver or without-driver options, and let  │
│                 our admin team help manage rental requests.      │
│                                                                 │
│                 ✅ Free basic listing  ✅ Admin-reviewed requests│
│                 ✅ Flexible pricing    ✅ With or without driver │
│                                                                 │
│                                    [List Your Car Now →]        │
└─────────────────────────────────────────────────────────────────┘
```

- Full-width section with blue gradient background
- Left: Car illustration/image
- Right: Headline, description, bullet points, primary CTA button
- Mobile: Stacked, image above text

### 2.9 Popular Locations

```
Popular Locations

[Addis Ababa] [Bole] [CMC] [Megenagna] [Kazanchis] [Ayat] [Sarbet] [Piassa]
                                                          View all locations →
```

- Horizontal row of location pill/chip buttons
- Each is a filter shortcut to browse page
- "View all locations" link at end
- Scrollable on mobile

### 2.10 Bottom CTA Banner

```
┌─────────────────────────────────────────────────────────────────┐
│  Find your next rental car today                                │
│  Trusted cars. Verified owners. Safe rentals.                   │
│                            [Browse Cars]  [List Your Car]       │
└─────────────────────────────────────────────────────────────────┘
```

- Dark blue background, white text
- Centered headline + tagline
- Two CTA buttons: "Browse Cars" (white/outline), "List Your Car" (white filled)

### 2.11 Footer

```
┌─────────────────────────────────────────────────────────────────┐
│ 🔵 MyProperties          Company      Support       Legal      │
│ Rent with trust.          About Us     Help Center   ToS       │
│ Drive with confidence.    How It Works Safety Rules  Privacy   │
│                           List Your Car Contact Us   Refund &  │
│ [f] [x] [ig] [in]        Blog         Report        Deposit   │
│                                                                 │
│                           Need help?                            │
│                           📞 +251 911 123 456                   │
│                           ✉️ info@myproperties...               │
│                           📍 Addis Ababa, Ethiopia              │
│                                                                 │
│ © 2025 MyProperties. All rights reserved.                       │
└─────────────────────────────────────────────────────────────────┘
```

- White background, subtle top border
- 4-column layout: Brand + socials, Company links, Support links, Legal links
- Contact info section with phone, email, address
- Copyright bar at bottom

---

## 3. Listing Card Component Spec

The listing card is the most reused component across the app. It must work for cars now and be extensible for properties later.

### Props / Data

| Field | Type | Example | Required |
|---|---|---|---|
| `id` | uuid | — | ✅ |
| `title` | string | "Toyota Corolla 2018" | ✅ |
| `location` | string | "Kazanchis, Addis Ababa" | ✅ |
| `coverImage` | URL | — | ✅ |
| `basePrice` | number | 3000 | ✅ |
| `currency` | string | "ETB" | ✅ |
| `pricePeriod` | string | "day" | ✅ |
| `driverFee` | number \| null | 1500 | ❌ |
| `deliveryAvailable` | boolean | true | ❌ |
| `hasDriver` | boolean | true | ❌ |
| `isVerified` | boolean | true | ❌ |
| `rating` | number \| null | 4.8 | ❌ (post-MVP) |
| `reviewCount` | number \| null | 32 | ❌ (post-MVP) |

### Visual Badges

| Badge | Condition | Color |
|---|---|---|
| "With Driver" | `hasDriver === true` | Blue pill |
| "Without Driver" | `hasDriver === false` | Gray pill |
| "Delivery" | `deliveryAvailable === true` | Green pill |
| "Verified Owner" | `isVerified === true` | Green checkmark (on featured card only) |

### Listing Card States

| State | Visual Change |
|---|---|
| Default | Standard card |
| Hover | `translateY(-2px)`, shadow increases to `--shadow-lg` |
| Favorited | Heart icon filled red |
| Loading | Skeleton placeholder (gray pulse animation) |

---

## 4. Search Box Component Spec

The hero search box is the primary user action on the homepage.

### Fields

| Field | Input Type | Placeholder | Icon |
|---|---|---|---|
| Pick-up location | Text input with autocomplete | "Addis Ababa, Ethiopia" | 📍 |
| Start date | Date picker | "May 25, 2025" | 📅 |
| End date | Date picker | "May 28, 2025" | 📅 |
| Driver option | Select dropdown | "With Driver" / "Without Driver" / "Any" | 🚗 |

### Layout

- **Desktop:** Single row — 4 fields + search button inline
- **Tablet:** 2×2 grid + search button below
- **Mobile:** Stacked vertically + full-width search button

### Styling

- White card with `--radius-lg` and `--shadow-lg`
- Internal field dividers (light vertical borders on desktop)
- Search button: Primary blue, "🔍 Search Cars" label

---

## 5. Category Card Component Spec

| Field | Type |
|---|---|
| `icon` | React component or image (48×48) |
| `name` | string ("Economy Cars", "SUVs", "Luxury Cars", etc.) |
| `description` | string (short, 1 line) |
| `filterValue` | string (maps to browse page filter param) |

### Current Categories (Cars)

| Category | Icon Style | Filter |
|---|---|---|
| Economy Cars | Compact car illustration | `category=economy` |
| SUVs | SUV illustration | `category=suv` |
| Luxury Cars | Premium car illustration | `category=luxury` |
| With Driver | Driver illustration | `driver=with` |
| Without Driver | Key illustration | `driver=without` |
| Delivery Available | Delivery truck illustration | `delivery=true` |

### Future Categories (Properties — not implemented yet)

| Category | Icon Style | Filter |
|---|---|---|
| Apartments | Building illustration | `category=apartment` |
| Villas | House illustration | `category=villa` |
| Office Space | Office illustration | `category=office` |

---

## 6. Dashboard UI Direction

Dashboards follow the same white/blue design system but with a sidebar navigation pattern instead of the marketing header.

### Layout Structure

```
┌──────┬──────────────────────────────────┐
│ Side │  Header (breadcrumb + user)      │
│ bar  ├──────────────────────────────────┤
│      │                                  │
│ Nav  │  Content Area                    │
│ links│                                  │
│      │  Cards, tables, forms            │
│      │                                  │
└──────┴──────────────────────────────────┘
```

- **Mobile:** Sidebar collapses to bottom tab bar or hamburger
- **Table views:** Horizontal scroll on mobile, paginated
- **Status badges:** Use semantic colors (pending=yellow, confirmed=green, rejected=red)

---

## 7. Scalability Notes (Cars → Properties)

The UI is designed to support property listings without structural changes:

| Concern | Car Implementation | Property Adaptation |
|---|---|---|
| Listing card | Shows car image, make/model, ETB/day | Shows property image, type/bedrooms, ETB/month |
| Category cards | Economy, SUV, Luxury, etc. | Apartment, Villa, Office, etc. |
| Search fields | Location, dates, driver option | Location, dates, bedrooms, price range |
| Detail page | Car specs, driver options | Property specs, amenities, floor plan |
| Pricing section | Base rental/day + driver fee + delivery | Base rental/month + utilities + maintenance |
| Hero headline | "Rent verified cars" | "Find your perfect rental" |

The `ListingCard` component renders differently based on `listing.type` — polymorphic by design (per ADR-0001, Decision 2).

---

## 8. Image Assets Needed

| Asset | Format | Usage |
|---|---|---|
| Logo mark (blue circle) | SVG | Header, favicon |
| Logo text ("MyProperties") | SVG | Header |
| Hero car image | WebP/PNG | Hero section right column |
| Category icons (×6) | SVG | Browse by Category cards |
| How It Works icons (×4) | SVG | Process steps |
| Trust badge icons (×4) | SVG | Trust badges row |
| Empty state illustration | SVG | No results, empty dashboards |
| CTA banner car image | WebP/PNG | "List Your Car" section |
| Social media icons (×4) | SVG | Footer |

---

## 9. Key Design Decisions

1. **White/blue over dark theme** — The uploaded reference shows a clean white marketplace. The existing dark theme will be fully replaced.
2. **Search-first hero** — The search box is the primary CTA, not "Browse" or "Sign Up".
3. **Transparent pricing** — A dedicated section explains all fees. Commission is clearly disclosed.
4. **Admin-reviewed badge** — Prominently displayed in trust badges to differentiate from peer-to-peer platforms.
5. **No ratings in MVP** — Rating stars appear in the reference but ratings are documented as post-MVP (per `tasks.md` Task Group 3). Cards should reserve space for ratings but show nothing until implemented.
6. **Multilingual from day one** — Language switcher is in the header nav. All strings must be externalized.
