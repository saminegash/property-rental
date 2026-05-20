import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CarHeroSearchForm } from "./CarHeroSearchForm";

interface FeaturedCarData {
  id: string;
  title: string;
  location: string | null;
  vehicle_details: {
    make: string;
    model: string;
    year: number;
  }[];
  rental_terms: {
    daily_price: number | null;
    daily_driver_fee: number | null;
    security_deposit_amount: number;
    delivery_fee: number | null;
    available_with_driver: boolean;
    available_without_driver: boolean;
    delivery_available: boolean;
  }[];
  listing_images: {
    image_url: string;
    is_primary: boolean;
  }[];
}

const fallbackCar = {
  id: "featured-fallback",
  title: "Toyota RAV4 2020",
  location: "Bole, Addis Ababa",
  vehicle_details: [{ make: "Toyota", model: "RAV4", year: 2020 }],
  rental_terms: [{
    daily_price: 3500,
    daily_driver_fee: 1500,
    security_deposit_amount: 15000,
    delivery_fee: 500,
    available_with_driver: true,
    available_without_driver: true,
    delivery_available: true,
  }],
  listing_images: [{
    image_url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
    is_primary: true,
  }],
};

export async function CarHeroSection() {
  const supabase = await createClient();

  // Fetch the most recent published car listing to feature
  const { data: listings } = await supabase
    .from("listings")
    .select(`
      id, title, location,
      vehicle_details ( make, model, year ),
      rental_terms ( daily_price, daily_driver_fee, security_deposit_amount, delivery_fee, available_with_driver, available_without_driver, delivery_available ),
      listing_images ( image_url, is_primary )
    `)
    .eq("category", "vehicle")
    .eq("listing_type", "rent")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(1);

  const featured: FeaturedCarData = (listings && listings.length > 0)
    ? (listings[0] as unknown as FeaturedCarData)
    : fallbackCar;

  const vd = featured.vehicle_details?.[0];
  const rt = featured.rental_terms?.[0];
  const coverImage = featured.listing_images?.find((img) => img.is_primary)?.image_url
    || featured.listing_images?.[0]?.image_url
    || fallbackCar.listing_images[0].image_url;

  const carName = vd ? `${vd.make} ${vd.model} ${vd.year}` : featured.title;
  const carLocation = featured.location || "Addis Ababa";
  const isFallback = featured.id === "featured-fallback";
  const carHref = isFallback ? "/cars" : `/cars/${featured.id}`;

  return (
    <section className="car-hero" id="car-hero">
      <div className="car-hero__container">
        {/* Left Column: Headline + Search */}
        <div className="car-hero__left">
          <h1 className="car-hero__headline">
            Rent verified cars <br className="car-hero__br-desktop" />
            with or <span className="car-hero__highlight">without</span> a driver
          </h1>
          <p className="car-hero__subtext">
            Find trusted cars, request rentals, and get your car delivered within hours or days.
          </p>

          {/* Search Form */}
          <CarHeroSearchForm />

          {/* Social Proof + How it works */}
          <div className="car-hero__bottom">
            <div className="car-hero__social-proof">
              <div className="car-hero__avatars">
                <div className="car-hero__avatar" style={{ zIndex: 3 }}>🧑🏽</div>
                <div className="car-hero__avatar" style={{ zIndex: 2 }}>👩🏾</div>
                <div className="car-hero__avatar" style={{ zIndex: 1 }}>👨🏿</div>
              </div>
              <span className="car-hero__proof-text">Join 2,000+ happy renters</span>
            </div>
            <Link href="#how-it-works" className="car-hero__how-link" id="car-hero-how-link">
              How it works
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Right Column: Featured Car Card */}
        <div className="car-hero__right">
          <Link href={carHref} className="car-hero-card" id="car-hero-featured-card">
            {/* Verified Owner Badge */}
            <div className="car-hero-card__verified">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Verified Owner
            </div>

            {/* Favorite */}
            <div
              className="car-hero-card__fav"
              aria-label="Save to favorites"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>

            {/* Car Image */}
            <div className="car-hero-card__image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverImage} alt={carName} className="car-hero-card__img" />
            </div>

            {/* Car Info */}
            <div className="car-hero-card__info">
              <h3 className="car-hero-card__name">{carName}</h3>
              <p className="car-hero-card__location">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {carLocation}
              </p>
            </div>

            {/* Price Breakdown */}
            <div className="car-hero-card__pricing">
              <div className="car-hero-card__price-row car-hero-card__price-row--main">
                <span className="car-hero-card__price-label">
                  <span className="car-hero-card__price-icon">🚗</span>
                  Car rental
                </span>
                <span className="car-hero-card__price-value car-hero-card__price-value--bold">
                  {rt?.daily_price ? `${rt.daily_price.toLocaleString()} ETB/day` : "Contact"}
                </span>
              </div>
              <div className="car-hero-card__price-row">
                <span className="car-hero-card__price-label">Driver fee</span>
                <span className="car-hero-card__price-value">
                  {rt?.daily_driver_fee ? `+${rt.daily_driver_fee.toLocaleString()}/day` : "N/A"}
                </span>
              </div>
              <div className="car-hero-card__price-row">
                <span className="car-hero-card__price-label">Security deposit</span>
                <span className="car-hero-card__price-value">
                  {rt?.security_deposit_amount ? `${rt.security_deposit_amount.toLocaleString()}` : "0"}
                </span>
              </div>
              <div className="car-hero-card__price-row">
                <span className="car-hero-card__price-label">Delivery fee</span>
                <span className="car-hero-card__price-value">
                  {rt?.delivery_fee ? `${rt.delivery_fee.toLocaleString()}` : "Free"}
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
