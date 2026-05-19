import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CarListingCard } from "@/components/cars/CarListingCard";

export const dynamic = "force-dynamic";

interface CarListing {
  id: string;
  title: string;
  location: string | null;
  vehicle_details?: Array<{ year: number }>;
  rental_terms?: Array<{
    daily_price: number | null;
    available_with_driver: boolean;
    available_without_driver: boolean;
    security_deposit_amount: number;
    delivery_available?: boolean;
    delivery_fee?: number | null;
  }>;
  listing_images?: Array<{ image_url: string; is_primary: boolean }>;
}

export default async function HomePage() {
  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("listings")
    .select(`
      id, title, location,
      vehicle_details ( make, model, year, transmission, fuel_type, seats, condition ),
      rental_terms ( daily_price, available_with_driver, available_without_driver, security_deposit_amount, delivery_available, delivery_fee ),
      listing_images ( image_url, is_primary )
    `)
    .eq("category", "vehicle")
    .eq("listing_type", "rent")
    .order("created_at", { ascending: false })
    .limit(8);

  const featuredCar = listings?.[0] as unknown as CarListing | undefined;

  // fallback data if no cars exist
  const fallbackCar: CarListing = {
    id: "fallback",
    title: "Toyota RAV4",
    location: "Bole, Addis Ababa",
    vehicle_details: [{ year: 2020 }],
    rental_terms: [{
      daily_price: 3500,
      available_with_driver: true,
      available_without_driver: true,
      security_deposit_amount: 15000,
    }],
    listing_images: [{ image_url: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fd?auto=format&fit=crop&w=800&q=80", is_primary: true }]
  };
  
  const featured = featuredCar || fallbackCar;

  const vd = featured.vehicle_details?.[0] || { year: 2020 };
  const rt = featured.rental_terms?.[0] || { daily_price: 3500, security_deposit_amount: 15000 };
  const img = featured.listing_images?.find((img) => img.is_primary)?.image_url || featured.listing_images?.[0]?.image_url || "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fd?auto=format&fit=crop&w=800&q=80";

  const featuredListings = listings && listings.length > 0 ? listings : Array(4).fill(featured);

  return (
    <>
      {/* Hero Section */}
      <section className="bg-(--color-primary-surface) py-12 lg:py-20" id="hero">
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Column */}
          <div className="flex flex-col gap-8">
            <div>
              <h1 className="text-4xl lg:text-[3.25rem] font-bold text-(--color-text-heading) leading-[1.15] mb-5">
                Rent verified cars <br />
                with or <span className="text-(--color-primary)">without</span> a driver
              </h1>
              <p className="text-lg text-(--color-text-muted) leading-relaxed max-w-[540px]">
                Find trusted cars, request rentals, and get your car delivered within hours or days.
              </p>
            </div>

            {/* Search Box */}
            <form action="/cars" className="bg-white rounded-2xl shadow-(--shadow-lg) p-6 flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-[0.6875rem] font-bold text-(--color-text-muted) uppercase tracking-wider">Pick-up Location</label>
                  <input type="text" name="location" placeholder="Addis Ababa, Ethiopia" className="w-full text-[0.9375rem] border-b border-(--color-border) py-1.5 focus:outline-none focus:border-(--color-primary) text-(--color-text-heading)" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[0.6875rem] font-bold text-(--color-text-muted) uppercase tracking-wider">Start Date</label>
                  <input type="date" name="start" className="w-full text-[0.9375rem] border-b border-(--color-border) py-1.5 focus:outline-none focus:border-(--color-primary) text-(--color-text-heading)" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[0.6875rem] font-bold text-(--color-text-muted) uppercase tracking-wider">End Date</label>
                  <input type="date" name="end" className="w-full text-[0.9375rem] border-b border-(--color-border) py-1.5 focus:outline-none focus:border-(--color-primary) text-(--color-text-heading)" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-5 items-end mt-1">
                <div className="flex flex-col gap-2">
                  <label className="text-[0.6875rem] font-bold text-(--color-text-muted) uppercase tracking-wider">Driver Option</label>
                  <select name="driver" className="w-full text-[0.9375rem] border-b border-(--color-border) py-1.5 focus:outline-none focus:border-(--color-primary) bg-transparent text-(--color-text-heading) cursor-pointer appearance-none">
                    <option value="">Any Option</option>
                    <option value="with">With Driver</option>
                    <option value="without">Without Driver</option>
                  </select>
                </div>
                <button type="submit" className="bg-(--color-primary) hover:bg-(--color-primary-hover) text-white font-medium py-3.5 px-8 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md w-full md:w-auto">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  Search Cars
                </button>
              </div>
            </form>

            {/* Social Proof & Secondary Link */}
            <div className="flex items-center gap-6 mt-2">
              <div className="flex items-center">
                <div className="flex -space-x-3">
                  <div className="w-9 h-9 rounded-full border-2 border-(--color-primary-surface) bg-[#E5E7EB] flex items-center justify-center text-lg z-30">🧑🏽</div>
                  <div className="w-9 h-9 rounded-full border-2 border-(--color-primary-surface) bg-[#D1D5DB] flex items-center justify-center text-lg z-20">👩🏾</div>
                  <div className="w-9 h-9 rounded-full border-2 border-(--color-primary-surface) bg-[#9CA3AF] flex items-center justify-center text-lg z-10">👨🏿</div>
                </div>
                <span className="ml-3 text-[0.875rem] font-medium text-(--color-text-muted)">Join 2,000+ happy renters</span>
              </div>
              <div className="w-px h-6 bg-(--color-border) hidden sm:block"></div>
              <Link href="/#how-it-works" className="text-[0.875rem] font-semibold text-(--color-primary) hover:underline flex items-center gap-1">
                How it works
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </Link>
            </div>
          </div>

          {/* Right Column - Featured Card */}
          <div className="hidden lg:block w-full max-w-[420px] ml-auto relative">
            <div className="absolute -top-5 -left-5 bg-white rounded-full pl-3 pr-4 py-2.5 shadow-md z-10 flex items-center gap-2 border border-(--color-border-light)">
              <div className="bg-(--color-success) text-white rounded-full w-5 h-5 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <span className="text-[0.875rem] font-bold text-(--color-text-heading) tracking-tight">Verified Owner</span>
            </div>
            
            <div className="bg-white rounded-2xl shadow-(--shadow-card) overflow-hidden border border-(--color-border) relative">
              <div className="relative aspect-4/3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={featured.title} className="w-full h-full object-cover" />
                <button className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-(--color-text-muted) hover:text-(--color-error) transition-colors shadow-sm">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-[1.125rem] text-(--color-text-heading) leading-tight">
                      {vd.year ? `${vd.year} ` : ""}{featured.title}
                    </h3>
                    <p className="text-[0.875rem] text-(--color-text-muted) flex items-center gap-1 mt-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      {featured.location || "Addis Ababa"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-(--color-warning) bg-(--color-warning-bg) px-2 py-1 rounded-lg">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    <span className="text-[0.875rem] font-bold text-(--color-text-heading) ml-0.5">4.9</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-(--color-border-light) flex flex-col gap-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[0.875rem] font-medium text-(--color-text-muted) flex items-center gap-2">
                      <span className="text-[1.125rem]">🚗</span> Car rental price
                    </span>
                    <span className="font-bold text-(--color-primary) text-[1rem]">
                      {rt.daily_price ? `${rt.daily_price.toLocaleString()} ETB/day` : "Contact for price"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[0.875rem] text-(--color-text-muted)">Driver fee</span>
                    <span className="text-[0.875rem] font-medium text-(--color-text-heading)">+1,500 ETB/day</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[0.875rem] text-(--color-text-muted)">Security deposit</span>
                    <span className="text-[0.875rem] font-medium text-(--color-text-heading)">
                      {rt.security_deposit_amount > 0 ? `${rt.security_deposit_amount.toLocaleString()} ETB` : "None"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[0.875rem] text-(--color-text-muted)">Delivery fee</span>
                    <span className="text-[0.875rem] font-medium text-(--color-text-heading)">+500 ETB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="mp-trust" id="trust-badges">
        <div className="mp-trust__inner">
          <div className="mp-trust__card">
            <div className="mp-trust__icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1A6DFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h3 className="mp-trust__title">Verified Owners</h3>
            <p className="mp-trust__desc">All owners are verified for your safety</p>
          </div>
          <div className="mp-trust__card">
            <div className="mp-trust__icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1A6DFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3 className="mp-trust__title">Admin Reviewed</h3>
            <p className="mp-trust__desc">Every listing is checked by our admin team</p>
          </div>
          <div className="mp-trust__card">
            <div className="mp-trust__icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1A6DFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            </div>
            <h3 className="mp-trust__title">With or Without Driver</h3>
            <p className="mp-trust__desc">Choose the option that fits your trip</p>
          </div>
          <div className="mp-trust__card">
            <div className="mp-trust__icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1A6DFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
            </div>
            <h3 className="mp-trust__title">Transparent Pricing</h3>
            <p className="mp-trust__desc">Clear price breakdown &amp; low commission</p>
          </div>
        </div>
      </section>

      {/* Featured Cars Section */}
      <section className="py-16 lg:py-24 bg-(--color-surface-alt) border-b border-(--color-border-light)">
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex justify-between items-end mb-8 lg:mb-10">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-(--color-text-heading) mb-2">Featured Cars</h2>
              <p className="text-(--color-text-muted)">Top rated and most trusted cars, ready for you.</p>
            </div>
            <Link href="/cars" className="hidden sm:flex items-center gap-1 font-semibold text-(--color-primary) hover:underline">
              View all cars <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </Link>
          </div>

          <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 lg:grid lg:grid-cols-4 lg:gap-6 lg:pb-0 lg:overflow-visible" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {featuredListings.map((car: CarListing, idx: number) => {
              const vd = car.vehicle_details?.[0];
              const rt = car.rental_terms?.[0];
              const coverImg = car.listing_images?.find((img) => img.is_primary)?.image_url || car.listing_images?.[0]?.image_url || "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fd?auto=format&fit=crop&w=800&q=80";

              return (
                <CarListingCard
                  key={car.id || idx}
                  id={car.id}
                  title={`${vd?.year ? `${vd.year} ` : ""}${car.title}`}
                  location={car.location || "Addis Ababa"}
                  image={coverImg}
                  dailyPrice={rt?.daily_price || null}
                  driverFee={1500}
                  securityDeposit={rt?.security_deposit_amount || 0}
                  deliveryAvailable={!!rt?.delivery_available}
                  withDriver={!!rt?.available_with_driver}
                  withoutDriver={!!rt?.available_without_driver}
                  rating={4.9}
                  reviewCount={24}
                  href={`/cars/${car.id}`}
                />
              );
            })}
          </div>
          
          <div className="mt-6 sm:hidden">
            <Link href="/cars" className="block w-full text-center py-3 bg-white border border-(--color-border) rounded-xl text-[0.875rem] font-semibold text-(--color-text-heading) shadow-sm">
              View all cars
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mp-steps" id="how-it-works">
        <div className="mp-steps__inner">
          <h2 className="mp-section-title">How It Works</h2>
          <div className="mp-steps__grid">
            <div className="mp-steps__step">
              <span className="mp-steps__number">1</span>
              <h3 className="mp-steps__label">Choose a car</h3>
              <p className="mp-steps__desc">Browse available cars and select the one you like.</p>
            </div>
            <div className="mp-steps__step">
              <span className="mp-steps__number">2</span>
              <h3 className="mp-steps__label">Send rental request</h3>
              <p className="mp-steps__desc">Submit your request with dates, driver option and details.</p>
            </div>
            <div className="mp-steps__step">
              <span className="mp-steps__number">3</span>
              <h3 className="mp-steps__label">Admin confirms with owner</h3>
              <p className="mp-steps__desc">Our admin team verifies and confirms availability with the owner.</p>
            </div>
            <div className="mp-steps__step">
              <span className="mp-steps__number">4</span>
              <h3 className="mp-steps__label">Receive the car</h3>
              <p className="mp-steps__desc">Pick up or get delivery and enjoy your trip.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="mp-cta-banner" id="cta-banner">
        <div className="mp-cta-banner__inner">
          <div className="mp-cta-banner__content">
            <h2 className="mp-cta-banner__title">Find your next rental car today</h2>
            <p className="mp-cta-banner__subtitle">Trusted cars. Verified owners. Safe rentals.</p>
          </div>
          <div className="mp-cta-banner__actions">
            <Link href="/cars" className="mp-btn mp-btn--white" id="cta-browse-btn">
              Browse Cars
            </Link>
            <Link href="/dashboard/owner/listings/new" className="mp-btn mp-btn--outline-white" id="cta-list-btn">
              List Your Car
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
