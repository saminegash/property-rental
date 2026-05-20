import Link from "next/link";

export interface CarListingCardProps {
  id: string;
  title: string;
  location: string;
  image: string;
  dailyPrice: number | null;
  driverFee: number;
  securityDeposit: number;
  deliveryAvailable: boolean;
  withDriver: boolean;
  withoutDriver: boolean;
  rating?: number | null;
  reviewCount?: number | null;
  isVerifiedOwner?: boolean;
  isFeatured?: boolean;
  href: string;
}

/**
 * Reusable car listing card used across homepage, browse page, and related listings.
 *
 * Follows the design system tokens from `docs/design-system.md`:
 * - `--radius-lg` (12px) for card corners
 * - `--shadow-card` for default, `--shadow-lg` on hover
 * - `--color-primary` for "With Driver" badge
 * - `--color-text-muted` for "Without Driver" badge
 * - `--color-success` for "Delivery" and "Verified Owner" badges
 * - Card hover: translateY(-2px) with shadow increase
 */
export function CarListingCard({
  title,
  location,
  image,
  dailyPrice,
  driverFee,
  securityDeposit,
  deliveryAvailable,
  withDriver,
  withoutDriver,
  rating,
  reviewCount,
  isVerifiedOwner = false,
  isFeatured = false,
  href,
}: CarListingCardProps) {
  const hasRating = rating != null && rating > 0;

  return (
    <div className="car-listing-card group">
      {/* Image Area */}
      <div className="car-listing-card__image-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={`${title} — rental car in ${location}`}
          className="car-listing-card__img"
          loading="lazy"
        />

        {/* Badge overlays — top-left */}
        <div className="car-listing-card__badges">
          {withDriver && (
            <span className="car-listing-card__badge car-listing-card__badge--driver">
              With Driver
            </span>
          )}
          {withoutDriver && (
            <span className="car-listing-card__badge car-listing-card__badge--self">
              Without Driver
            </span>
          )}
          {deliveryAvailable && (
            <span className="car-listing-card__badge car-listing-card__badge--delivery">
              Delivery
            </span>
          )}
        </div>

        {/* Verified Owner — bottom-left of image */}
        {isVerifiedOwner && (
          <div className="car-listing-card__verified">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            Verified
          </div>
        )}

        {/* Favorite icon — top-right */}
        <div
          className="car-listing-card__fav"
          role="button"
          tabIndex={0}
          aria-label={`Save ${title} to favorites`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>

        {/* Featured ribbon */}
        {isFeatured && (
          <div className="car-listing-card__featured">Featured</div>
        )}
      </div>

      {/* Content Area */}
      <div className="car-listing-card__body">
        {/* Title */}
        <h3 className="car-listing-card__title">{title}</h3>

        {/* Location */}
        <p className="car-listing-card__location">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {location}
        </p>

        {/* Price */}
        <div className="car-listing-card__price-block">
          <div className="car-listing-card__price-icon" aria-hidden="true">🚗</div>
          <div>
            <div className="car-listing-card__price-label">Base Price</div>
            <div className="car-listing-card__price-value">
              {dailyPrice ? `${dailyPrice.toLocaleString()} ETB/day` : "Contact for price"}
            </div>
          </div>
        </div>

        {/* Fee breakdown */}
        <div className="car-listing-card__fees">
          <div className="car-listing-card__fee-row">
            <span className="car-listing-card__fee-label">Driver fee</span>
            <span className="car-listing-card__fee-value">
              {driverFee > 0 ? `+${driverFee.toLocaleString()}/day` : "Included"}
            </span>
          </div>
          <div className="car-listing-card__fee-row">
            <span className="car-listing-card__fee-label">Deposit</span>
            <span className="car-listing-card__fee-value">
              {securityDeposit > 0 ? securityDeposit.toLocaleString() : "0"}
            </span>
          </div>
        </div>

        {/* Footer: Rating + CTA */}
        <div className="car-listing-card__footer">
          {hasRating ? (
            <div className="car-listing-card__rating">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span className="car-listing-card__rating-score">
                {rating}
                {reviewCount != null && reviewCount > 0 && (
                  <span className="car-listing-card__rating-count"> ({reviewCount})</span>
                )}
              </span>
            </div>
          ) : (
            <div className="car-listing-card__rating car-listing-card__rating--new">
              <span className="car-listing-card__rating-score">New</span>
            </div>
          )}
          <Link
            href={href}
            className="car-listing-card__cta"
            aria-label={`Request ${title} now`}
          >
            Request Now →
          </Link>
        </div>
      </div>
    </div>
  );
}
