import Link from "next/link";

export interface PropertyListingCardProps {
  id: string;
  title: string;
  location: string;
  image: string;
  price: number;
  type: "rent" | "sale";
  propertyType?: string;
  beds: number;
  baths: number;
  area: number;
  isVerified?: boolean;
  isFeatured?: boolean;
  href: string;
}

/**
 * Reusable property listing card used across homepage, browse page, and related listings.
 *
 * Follows the design system tokens from `docs/design-system.md`:
 * - `--radius-lg` (12px) for card corners
 * - `--shadow-card` for default, `--shadow-lg` on hover
 * - `--color-primary` for badges
 * - `--color-success` for "Verified" badge
 * - Card hover: translateY(-2px) with shadow increase
 */
export function PropertyListingCard({
  title,
  location,
  image,
  price,
  type,
  propertyType = "Property",
  beds,
  baths,
  area,
  isVerified = false,
  isFeatured = false,
  href,
}: PropertyListingCardProps) {
  return (
    <div className="property-listing-card">
      {/* Image Area */}
      <div className="property-listing-card__image-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={`${title} — property in ${location}`}
          className="property-listing-card__img"
          loading="lazy"
        />

        {/* Badge overlays — top-left */}
        <div className="property-listing-card__badges">
          {isVerified && (
            <span className="property-listing-card__badge property-listing-card__badge--verified">
              Verified
            </span>
          )}
          {isFeatured && (
            <span className="property-listing-card__badge property-listing-card__badge--featured">
              Featured
            </span>
          )}
        </div>

        {/* Favorite icon — top-right */}
        <div
          className="property-listing-card__fav"
          role="button"
          tabIndex={0}
          aria-label={`Save ${title} to favorites`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>

        {/* Status Badge — bottom-left */}
        <div className="property-listing-card__status-badge">
          {propertyType} For {type === "rent" ? "Rent" : "Sale"}
        </div>
      </div>

      {/* Content Area */}
      <div className="property-listing-card__body">
        {/* Title */}
        <h3 className="property-listing-card__title">{title}</h3>

        {/* Location */}
        <p className="property-listing-card__location">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {location}
        </p>

        {/* Price */}
        <div className="property-listing-card__price">
          {type === "sale" && (!price || price === 0) ? (
            <span style={{ fontSize: "1.1rem" }}>Price on Request</span>
          ) : (
            <>
              {price.toLocaleString()} ETB
              {type === "rent" && (
                <span className="property-listing-card__price-period">/month</span>
              )}
            </>
          )}
        </div>

        {/* Specs row */}
        <div className="property-listing-card__specs">
          <div className="property-listing-card__spec">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>{beds} Beds</span>
          </div>
          <div className="property-listing-card__spec">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 12h20" />
              <path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" />
              <path d="M4 6v6" />
              <path d="M20 6v6" />
              <path d="M8 2h8" />
              <path d="M12 2v4" />
            </svg>
            <span>{baths} Baths</span>
          </div>
          <div className="property-listing-card__spec">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
            <span>{area} m²</span>
          </div>
        </div>
      </div>

      {/* Full-card link overlay */}
      <Link href={href} className="property-listing-card__link" aria-label={`View details for ${title}`} />
    </div>
  );
}
