# Design System — MyProperties Marketplace

> **Status:** Active
> **Last updated:** 2026-05-19
> **Visual reference:** `docs/ui-reference.md`
> **Constitution:** `.specify/memory/constitution.md`

---

## 1. Design Philosophy

The marketplace follows a **clean, white/blue, premium-but-simple** aesthetic. The design prioritizes:

- **Clarity over decoration** — generous whitespace, clear hierarchy, readable type
- **Trust-first visual language** — verified badges, transparent pricing, admin-reviewed flows
- **Mobile-first responsive design** — all layouts designed for 320px+ and scale up
- **Search-focused interaction** — the hero search bar is the primary user action
- **Scalable UI patterns** — components work for cars now, properties later

---

## 2. Brand

| Token | Value | Notes |
|---|---|---|
| **Product name** | MyProperties | Appears in header and footer |
| **Tagline** | *Rent with trust. Drive with confidence.* | Below logo in header and in CTA banner |
| **Favicon** | Blue circle with "M" mark | Matches primary blue |
| **Tone** | Professional, trustworthy, approachable | Never playful, never aggressive |

---

## 3. Color Palette

### Primary Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#1A6DFF` | Primary buttons, links, active states, logo accent |
| `--color-primary-hover` | `#1558CC` | Hover state for primary blue elements |
| `--color-primary-light` | `#E8F0FE` | Light blue tint backgrounds, selected states |
| `--color-primary-surface` | `#F0F6FF` | Hero section background, feature card hover |

### Neutral Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-bg` | `#FFFFFF` | Page background |
| `--color-surface` | `#FFFFFF` | Cards, modals |
| `--color-surface-alt` | `#F7F8FA` | Alternating section backgrounds, pricing bar |
| `--color-border` | `#E5E7EB` | Card borders, dividers, input borders |
| `--color-border-light` | `#F0F1F3` | Subtle separators |

### Text Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-text` | `#1A1A2E` | Primary body text |
| `--color-text-heading` | `#0F172A` | Headings, card titles |
| `--color-text-muted` | `#6B7280` | Secondary text, labels, metadata |
| `--color-text-light` | `#9CA3AF` | Placeholder text, disabled labels |
| `--color-text-inverse` | `#FFFFFF` | Text on dark/primary backgrounds |

### Semantic Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-success` | `#16A34A` | Verified badges, active status, confirmations |
| `--color-success-bg` | `#F0FDF4` | Success alert background |
| `--color-warning` | `#F59E0B` | Pending status, caution alerts |
| `--color-warning-bg` | `#FFFBEB` | Warning alert background |
| `--color-error` | `#DC2626` | Error states, rejected status |
| `--color-error-bg` | `#FEF2F2` | Error alert background |
| `--color-info` | `#3B82F6` | Informational badges, tips |

### Badge-Specific Colors

| Token | Hex | Usage |
|---|---|---|
| `--badge-with-driver` | `#1A6DFF` | "With Driver" tag (blue pill) |
| `--badge-without-driver` | `#6B7280` | "Without Driver" tag (gray pill) |
| `--badge-delivery` | `#16A34A` | "Delivery" tag (green pill) |
| `--badge-verified` | `#16A34A` | "Verified Owner" checkmark badge |

---

## 4. Typography

### Font Stack

```css
--font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
```

Load via Google Fonts: `Inter` weights 400, 500, 600, 700.

### Type Scale

| Role | Size | Weight | Line Height | Token |
|---|---|---|---|---|
| Hero heading | 2.5rem (40px) | 700 | 1.2 | `--text-hero` |
| Section heading | 1.5rem (24px) | 700 | 1.3 | `--text-section` |
| Card title | 1rem (16px) | 600 | 1.4 | `--text-card-title` |
| Body | 0.9375rem (15px) | 400 | 1.6 | `--text-body` |
| Body small | 0.875rem (14px) | 400 | 1.5 | `--text-body-sm` |
| Caption / metadata | 0.8125rem (13px) | 400 | 1.4 | `--text-caption` |
| Badge / tag | 0.75rem (12px) | 600 | 1 | `--text-badge` |
| Micro label | 0.6875rem (11px) | 500 | 1.2 | `--text-micro` |

### Mobile Overrides

| Role | Mobile Size |
|---|---|
| Hero heading | 1.75rem (28px) |
| Section heading | 1.25rem (20px) |

---

## 5. Spacing

Based on a 4px grid. Consistent spacing tokens used across all components.

| Token | Value | Usage |
|---|---|---|
| `--space-1` | 4px | Inline icon gap, micro padding |
| `--space-2` | 8px | Compact element gaps |
| `--space-3` | 12px | Card inner padding (tight) |
| `--space-4` | 16px | Standard component padding |
| `--space-5` | 20px | Between form fields |
| `--space-6` | 24px | Card padding, section sub-gap |
| `--space-8` | 32px | Between content blocks |
| `--space-10` | 40px | Section vertical padding |
| `--space-12` | 48px | Major section separation |
| `--space-16` | 64px | Hero padding, page-level gaps |

---

## 6. Border Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 6px | Inputs, small buttons |
| `--radius-md` | 8px | Cards, form elements |
| `--radius-lg` | 12px | Feature cards, hero search box |
| `--radius-xl` | 16px | Modal containers, hero card |
| `--radius-full` | 9999px | Badges, pills, avatar circles |

---

## 7. Shadows

| Token | Value | Usage |
|---|---|---|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift on cards |
| `--shadow-card` | `0 2px 8px rgba(0,0,0,0.08)` | Listing cards, feature cards |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.12)` | Hero search box, modals |
| `--shadow-nav` | `0 1px 3px rgba(0,0,0,0.06)` | Sticky header |

---

## 8. Layout

### Container

```css
--container-max: 1280px;
--container-padding: 24px; /* 16px on mobile */
```

### Grid System

| Breakpoint | Token | Min Width |
|---|---|---|
| Mobile | `--bp-sm` | 0px |
| Tablet | `--bp-md` | 768px |
| Desktop | `--bp-lg` | 1024px |
| Wide | `--bp-xl` | 1280px |

### Content Widths

| Context | Max Width |
|---|---|
| Full page container | 1280px |
| Content area | 1200px |
| Auth forms | 420px |
| Hero section | Full bleed background, 1280px content |

---

## 9. Component Tokens

### Buttons

| Variant | Background | Text | Border | Radius |
|---|---|---|---|---|
| **Primary** | `--color-primary` | `#FFFFFF` | none | `--radius-md` |
| **Primary hover** | `--color-primary-hover` | `#FFFFFF` | none | `--radius-md` |
| **Secondary** | `#FFFFFF` | `--color-primary` | 1px `--color-primary` | `--radius-md` |
| **Secondary hover** | `--color-primary-light` | `--color-primary` | 1px `--color-primary` | `--radius-md` |
| **Ghost** | transparent | `--color-text-muted` | none | `--radius-md` |

Button sizes:

| Size | Padding | Font Size |
|---|---|---|
| Small | 6px 12px | 13px |
| Default | 10px 20px | 14px |
| Large | 14px 28px | 16px |

### Inputs

| State | Background | Border | Shadow |
|---|---|---|---|
| Default | `#FFFFFF` | `--color-border` | none |
| Focus | `#FFFFFF` | `--color-primary` | `0 0 0 3px rgba(26,109,255,0.12)` |
| Error | `#FFFFFF` | `--color-error` | `0 0 0 3px rgba(220,38,38,0.08)` |
| Disabled | `--color-surface-alt` | `--color-border-light` | none |

Input sizing: 44px height (touch-friendly), 14px font, 12px padding-x.

### Cards

| Variant | Background | Border | Shadow | Radius |
|---|---|---|---|---|
| Listing card | `#FFFFFF` | 1px `--color-border` | `--shadow-card` | `--radius-lg` |
| Category card | `#FFFFFF` | 1px `--color-border` | `--shadow-sm` | `--radius-md` |
| Feature card (trust badges) | `#FFFFFF` | 1px `--color-border` | none | `--radius-md` |
| Pricing card | `--color-surface-alt` | 1px `--color-border` | none | `--radius-lg` |

---

## 10. Iconography

- **Style:** Outlined icons, 1.5px stroke, consistent 20×20 or 24×24 viewport
- **Source:** Lucide Icons (recommended) or Heroicons
- **Color:** Inherits `currentColor` — controlled by parent text color
- **Special icons:** Category cards use custom/illustrative icons at 48×48

---

## 11. Motion & Transitions

| Context | Property | Duration | Easing |
|---|---|---|---|
| Button hover | `background-color, box-shadow` | 150ms | `ease` |
| Card hover | `box-shadow, transform` | 200ms | `ease-out` |
| Input focus | `border-color, box-shadow` | 150ms | `ease` |
| Page transition | `opacity` | 200ms | `ease-in-out` |
| Slide carousel | `transform` | 300ms | `cubic-bezier(0.4, 0, 0.2, 1)` |

Card hover lift: `transform: translateY(-2px)` with `--shadow-lg`.

---

## 12. Responsive Strategy

### Mobile-First Breakpoints

All base styles are mobile. Progressive enhancement via `min-width` queries.

```css
/* Mobile: base styles (0–767px) */
/* Tablet: @media (min-width: 768px)  */
/* Desktop: @media (min-width: 1024px) */
/* Wide: @media (min-width: 1280px)    */
```

### Component Responsive Behavior

| Component | Mobile | Tablet | Desktop |
|---|---|---|---|
| Nav | Hamburger menu | Hamburger menu | Full horizontal nav |
| Hero search | Stacked inputs | 2-column grid | Inline row |
| Listing cards | 1 column | 2 columns | 4 columns (carousel) |
| Category cards | 2×3 grid | 3×2 grid | 6 in single row |
| How It Works | Vertical stack | 2×2 grid | 4 in single row |
| Pricing bar | Stacked blocks | 2×3 grid | Inline row |
| Footer | Stacked sections | 2-column grid | 4-column grid |

---

## 13. Accessibility

- **Color contrast:** All text meets WCAG 2.1 AA (4.5:1 for body, 3:1 for large text)
- **Focus indicators:** Visible focus ring on all interactive elements (`3px` blue outline)
- **Touch targets:** Minimum 44×44px on all tappable elements
- **Semantic HTML:** Proper heading hierarchy, landmark regions, ARIA labels
- **Alt text:** All listing images have descriptive alt text
- **Reduced motion:** Respect `prefers-reduced-motion` — disable transforms and transitions
- **Keyboard navigation:** Full tab navigation support, visible focus states
- **Language attribute:** `lang="en"` on `<html>`, with `lang` switching for multilingual

---

## 14. Dark Mode (Future)

The current implementation is light-mode only. The existing dark mode tokens in `globals.css` (from the initial scaffold) will be replaced with this light-mode design system. Dark mode will be added as a future enhancement using `prefers-color-scheme` media queries and a theme toggle.

---

## 15. Multilingual Support

- **Languages:** English (default), Amharic (አማርኛ), Afaan Oromo
- **Direction:** LTR for all supported languages
- **Font considerations:** Inter supports Latin characters. Amharic (Ethiopic script) uses `Noto Sans Ethiopic` as a fallback. Afaan Oromo uses the Latin script and is served by Inter.
- **Implementation:** Language switcher in header nav, `next-intl` or similar i18n library
- **UI impact:** All text strings externalized. Button and label widths accommodate longer Amharic text (typically 20-40% wider)

```css
--font-ethiopic: "Noto Sans Ethiopic", "Inter", sans-serif;
```

---

## 16. Token Migration Notes

The current `globals.css` uses a **dark theme** with indigo/purple primary colors from the initial scaffold. The new design system requires a complete token replacement:

| Current Token | New Token | Change |
|---|---|---|
| `--color-bg: #0a0a0f` | `--color-bg: #FFFFFF` | Dark → White |
| `--color-surface: #13131a` | `--color-surface: #FFFFFF` | Dark surface → White |
| `--color-primary: #6366f1` | `--color-primary: #1A6DFF` | Indigo → Clean blue |
| `--color-text: #e4e4e7` | `--color-text: #1A1A2E` | Light-on-dark → Dark-on-light |
| `--shadow-card: 0 4px 24px rgba(0,0,0,0.4)` | `--shadow-card: 0 2px 8px rgba(0,0,0,0.08)` | Heavy → Subtle |

The Tailwind import (`@import "tailwindcss"`) is retained since Tailwind v4 is already configured in the project. The design system tokens will be defined as CSS custom properties and Tailwind v4 theme extensions.
