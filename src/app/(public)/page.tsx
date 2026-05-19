import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CarListingCard } from "@/components/cars/CarListingCard";

import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kode Marketplace - Rent verified cars",
  description: "Find trusted cars, request rentals, and get your car delivered within hours or days.",
};
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
    .eq("status", "published")
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
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
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
              <div className="relative aspect-[4/3] bg-slate-100">
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
      <section className="py-8 lg:py-12 bg-white border-b border-(--color-border-light)" id="trust-badges">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          
          <div className="flex items-center gap-4 p-4 lg:p-5 bg-white rounded-2xl border border-(--color-border-light) shadow-(--shadow-sm)">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div>
              <h3 className="font-bold text-[0.9375rem] text-(--color-text-heading) mb-0.5">Verified Owners</h3>
              <p className="text-[0.75rem] text-(--color-text-muted) leading-tight">All owners are verified for your safety.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 lg:p-5 bg-white rounded-2xl border border-(--color-border-light) shadow-(--shadow-sm)">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>
              <h3 className="font-bold text-[0.9375rem] text-(--color-text-heading) mb-0.5">Admin Reviewed</h3>
              <p className="text-[0.75rem] text-(--color-text-muted) leading-tight">Every listing is checked by our admin team.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 lg:p-5 bg-white rounded-2xl border border-(--color-border-light) shadow-(--shadow-sm)">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
            </div>
            <div>
              <h3 className="font-bold text-[0.9375rem] text-(--color-text-heading) mb-0.5">With or Without Driver</h3>
              <p className="text-[0.75rem] text-(--color-text-muted) leading-tight">Choose the option that fits your trip.</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 lg:p-5 bg-white rounded-2xl border border-(--color-border-light) shadow-(--shadow-sm)">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
            </div>
            <div>
              <h3 className="font-bold text-[0.9375rem] text-(--color-text-heading) mb-0.5">Transparent Pricing</h3>
              <p className="text-[0.75rem] text-(--color-text-muted) leading-tight">Clear price breakdown &amp; low commission.</p>
            </div>
          </div>

        </div>
      </section>

      {/* Featured Cars Section */}
      <section className="py-16 lg:py-24 bg-(--color-surface-alt) border-b border-(--color-border-light)">
        <div className="max-w-7xl mx-auto px-6">
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

      {/* Browse by Category */}
      <section className="py-16 lg:py-24 bg-white border-b border-(--color-border-light)">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-8 lg:mb-10">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-(--color-text-heading) mb-2">Browse by Category</h2>
              <p className="text-(--color-text-muted)">Find the perfect car for your specific needs.</p>
            </div>
            <Link href="/cars" className="hidden sm:flex items-center gap-1 font-semibold text-(--color-primary) hover:underline">
              View all categories <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
            {/* Economy Cars */}
            <Link href="/cars?category=economy" className="group flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-(--shadow-sm) border border-(--color-border-light) hover:border-(--color-primary) hover:shadow-md transition-all duration-300">
              <div className="shrink-0 w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="10" rx="2" ry="2"></rect><circle cx="7" cy="18" r="2"></circle><circle cx="17" cy="18" r="2"></circle><line x1="12" y1="8" x2="12" y2="13"></line><line x1="19" y1="8" x2="15" y2="3"></line><line x1="5" y1="8" x2="9" y2="3"></line><line x1="9" y1="3" x2="15" y2="3"></line></svg>
              </div>
              <h3 className="font-bold text-[1rem] text-(--color-text-heading) mb-1 group-hover:text-(--color-primary) transition-colors">Economy Cars</h3>
              <p className="text-[0.8125rem] text-(--color-text-muted)">Budget friendly</p>
            </Link>
            
            {/* SUVs */}
            <Link href="/cars?category=suv" className="group flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-(--shadow-sm) border border-(--color-border-light) hover:border-(--color-primary) hover:shadow-md transition-all duration-300">
              <div className="shrink-0 w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mb-4 group-hover:scale-110 transition-transform">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="10" width="18" height="8" rx="2" ry="2"></rect><circle cx="7" cy="18" r="2"></circle><circle cx="17" cy="18" r="2"></circle><path d="M5 10l3-5h8l3 5"></path><line x1="12" y1="5" x2="12" y2="10"></line></svg>
              </div>
              <h3 className="font-bold text-[1rem] text-(--color-text-heading) mb-1 group-hover:text-(--color-primary) transition-colors">SUVs</h3>
              <p className="text-[0.8125rem] text-(--color-text-muted)">Spacious & tough</p>
            </Link>

            {/* Luxury Cars */}
            <Link href="/cars?category=luxury" className="group flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-(--shadow-sm) border border-(--color-border-light) hover:border-(--color-primary) hover:shadow-md transition-all duration-300">
              <div className="shrink-0 w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 mb-4 group-hover:scale-110 transition-transform">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
              </div>
              <h3 className="font-bold text-[1rem] text-(--color-text-heading) mb-1 group-hover:text-(--color-primary) transition-colors">Luxury Cars</h3>
              <p className="text-[0.8125rem] text-(--color-text-muted)">Premium rides</p>
            </Link>

            {/* With Driver */}
            <Link href="/cars?driver=with" className="group flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-(--shadow-sm) border border-(--color-border-light) hover:border-(--color-primary) hover:shadow-md transition-all duration-300">
              <div className="shrink-0 w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 mb-4 group-hover:scale-110 transition-transform">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="4"></circle><path d="M5.5 21v-2a4 4 0 0 1 4-4h5a4 4 0 0 1 4 4v2"></path><circle cx="12" cy="14" r="1.5"></circle></svg>
              </div>
              <h3 className="font-bold text-[1rem] text-(--color-text-heading) mb-1 group-hover:text-(--color-primary) transition-colors">With Driver</h3>
              <p className="text-[0.8125rem] text-(--color-text-muted)">Sit back & relax</p>
            </Link>

            {/* Without Driver */}
            <Link href="/cars?driver=without" className="group flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-(--shadow-sm) border border-(--color-border-light) hover:border-(--color-primary) hover:shadow-md transition-all duration-300">
              <div className="shrink-0 w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 mb-4 group-hover:scale-110 transition-transform">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle><line x1="12" y1="2" x2="12" y2="9"></line><line x1="12" y1="15" x2="12" y2="22"></line><line x1="2" y1="12" x2="9" y2="12"></line><line x1="15" y1="12" x2="22" y2="12"></line></svg>
              </div>
              <h3 className="font-bold text-[1rem] text-(--color-text-heading) mb-1 group-hover:text-(--color-primary) transition-colors">Without Driver</h3>
              <p className="text-[0.8125rem] text-(--color-text-muted)">Drive yourself</p>
            </Link>

            {/* Delivery Available */}
            <Link href="/cars?delivery=true" className="group flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-(--shadow-sm) border border-(--color-border-light) hover:border-(--color-primary) hover:shadow-md transition-all duration-300">
              <div className="shrink-0 w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-4 group-hover:scale-110 transition-transform">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect><rect x="16" y="8" width="7" height="8" rx="1" ry="1"></rect><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
              </div>
              <h3 className="font-bold text-[1rem] text-(--color-text-heading) mb-1 group-hover:text-(--color-primary) transition-colors">Delivery</h3>
              <p className="text-[0.8125rem] text-(--color-text-muted)">To your door</p>
            </Link>
          </div>
          
          <div className="mt-6 sm:hidden">
            <Link href="/cars" className="block w-full text-center py-3 bg-white border border-(--color-border) rounded-xl text-[0.875rem] font-semibold text-(--color-text-heading) shadow-sm">
              View all categories
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 lg:py-24 bg-(--color-surface-alt) border-b border-(--color-border-light)" id="how-it-works">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10 lg:mb-14">
            <h2 className="text-2xl lg:text-3xl font-bold text-(--color-text-heading) mb-2">How It Works</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 relative">

            {/* Step 1 */}
            <div className="relative z-10 flex items-start gap-4">
              <div className="flex-shrink-0 flex items-center mt-1">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[0.75rem] font-bold z-10 relative">1</div>
                {/* Connecting Line */}
                <div className="hidden lg:block absolute top-[16px] left-[1.5rem] w-[calc(100%-1.5rem)] border-t-2 border-dashed border-blue-100 -z-10"></div>
              </div>
              <div className="flex-shrink-0 w-12 h-12 rounded-full border border-blue-100 text-blue-600 flex items-center justify-center bg-white shadow-(--shadow-sm)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
              <div>
                <h3 className="font-bold text-[0.9375rem] text-(--color-text-heading) mb-1">Choose a car</h3>
                <p className="text-[0.8125rem] text-(--color-text-muted) leading-relaxed">Browse available cars and select the one you like.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex items-start gap-4">
              <div className="flex-shrink-0 flex items-center mt-1">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[0.75rem] font-bold z-10 relative">2</div>
                <div className="hidden lg:block absolute top-[16px] left-[1.5rem] w-[calc(100%-1.5rem)] border-t-2 border-dashed border-emerald-100 -z-10"></div>
              </div>
              <div className="flex-shrink-0 w-12 h-12 rounded-full border border-emerald-100 text-emerald-600 flex items-center justify-center bg-white shadow-(--shadow-sm)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </div>
              <div>
                <h3 className="font-bold text-[0.9375rem] text-(--color-text-heading) mb-1">Send rental request</h3>
                <p className="text-[0.8125rem] text-(--color-text-muted) leading-relaxed">Submit your request with dates, driver option and details.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex items-start gap-4">
              <div className="flex-shrink-0 flex items-center mt-1">
                <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-[0.75rem] font-bold z-10 relative">3</div>
                <div className="hidden lg:block absolute top-[16px] left-[1.5rem] w-[calc(100%-1.5rem)] border-t-2 border-dashed border-orange-100 -z-10"></div>
              </div>
              <div className="flex-shrink-0 w-12 h-12 rounded-full border border-orange-100 text-orange-600 flex items-center justify-center bg-white shadow-(--shadow-sm)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                <h3 className="font-bold text-[0.9375rem] text-(--color-text-heading) mb-1">Admin confirms</h3>
                <p className="text-[0.8125rem] text-(--color-text-muted) leading-relaxed">Our admin team securely verifies and confirms availability.</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative z-10 flex items-start gap-4">
              <div className="flex-shrink-0 flex items-center mt-1">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-[0.75rem] font-bold z-10 relative">4</div>
              </div>
              <div className="flex-shrink-0 w-12 h-12 rounded-full border border-purple-100 text-purple-600 flex items-center justify-center bg-white shadow-(--shadow-sm)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2" ry="2"/><rect x="16" y="8" width="7" height="8" rx="1" ry="1"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              </div>
              <div>
                <h3 className="font-bold text-[0.9375rem] text-(--color-text-heading) mb-1">Receive the car</h3>
                <p className="text-[0.8125rem] text-(--color-text-muted) leading-relaxed">Pick up or get delivery and enjoy your trip safely.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing Transparency */}
      <section className="py-16 lg:py-20 bg-white border-b border-(--color-border-light)" id="pricing-transparency">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[#F8FAFC] rounded-[2rem] p-8 lg:p-12 border border-(--color-border-light) shadow-(--shadow-sm)">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-10 lg:gap-16 items-start">
              
              {/* Left Column */}
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-2xl lg:text-[2rem] font-bold text-(--color-text-heading) leading-tight mb-4">
                    We believe in <br className="hidden lg:block" /> pricing transparency
                  </h2>
                  <p className="text-[1rem] text-(--color-text-muted) leading-relaxed max-w-sm">
                    Everything is shown clearly before you send your request.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 font-semibold px-4 py-3 rounded-xl border border-blue-100 self-start">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <span className="text-[0.875rem]">Commission is 5% of rental price only</span>
                </div>
              </div>

              {/* Right Column */}
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-5">
                  {/* Car Rental Price */}
                  <div className="bg-white p-5 rounded-2xl border border-(--color-border-light) shadow-(--shadow-sm) flex items-start gap-3">
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-[0.875rem] text-(--color-text-heading) mb-0.5">Car Rental Price</h4>
                      <div className="font-bold text-[1rem] text-(--color-text-heading) mb-1">3,000 ETB <span className="text-[0.75rem] text-(--color-text-muted) font-medium">/ day</span></div>
                      <p className="text-[0.75rem] text-(--color-text-muted) leading-tight">Base price for the car</p>
                    </div>
                  </div>

                  {/* Driver Fee */}
                  <div className="bg-white p-5 rounded-2xl border border-(--color-border-light) shadow-(--shadow-sm) flex items-start gap-3">
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-[0.875rem] text-(--color-text-heading) mb-0.5">Driver Fee</h4>
                      <div className="font-bold text-[1rem] text-(--color-text-heading) mb-1">+1,500 ETB <span className="text-[0.75rem] text-(--color-text-muted) font-medium">/ day</span></div>
                      <p className="text-[0.75rem] text-(--color-text-muted) leading-tight">If you choose with driver</p>
                    </div>
                  </div>

                  {/* Security Deposit */}
                  <div className="bg-white p-5 rounded-2xl border border-(--color-border-light) shadow-(--shadow-sm) flex items-start gap-3">
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-[0.875rem] text-(--color-text-heading) mb-0.5">Security Deposit</h4>
                      <div className="font-bold text-[1rem] text-(--color-text-heading) mb-1">15,000 ETB</div>
                      <p className="text-[0.75rem] text-(--color-text-muted) leading-tight">Refundable deposit</p>
                    </div>
                  </div>

                  {/* Delivery Fee */}
                  <div className="bg-white p-5 rounded-2xl border border-(--color-border-light) shadow-(--shadow-sm) flex items-start gap-3">
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2" ry="2"/><rect x="16" y="8" width="7" height="8" rx="1" ry="1"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-[0.875rem] text-(--color-text-heading) mb-0.5">Delivery Fee</h4>
                      <div className="font-bold text-[1rem] text-(--color-text-heading) mb-1">500 ETB</div>
                      <p className="text-[0.75rem] text-(--color-text-muted) leading-tight">If delivery is needed</p>
                    </div>
                  </div>

                  {/* Platform Commission */}
                  <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-(--shadow-sm) flex items-start gap-3 ring-1 ring-emerald-500/10">
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-[0.875rem] text-(--color-text-heading) mb-0.5">Platform Commission</h4>
                      <div className="font-bold text-[1rem] text-emerald-600 mb-1">5%</div>
                      <p className="text-[0.75rem] text-(--color-text-muted) leading-tight">Of rental price only</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start sm:items-center gap-2 text-[0.8125rem] text-(--color-text-muted) bg-white/50 py-3 px-4 rounded-xl border border-dashed border-slate-200 mt-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  <span>Driver fee, delivery fee, security deposit, damage fees, and penalties are <strong className="font-semibold text-slate-700">not included</strong> in commission.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Owner CTA Section */}
      <section className="py-12 lg:py-16 bg-white border-b border-(--color-border-light)" id="owner-cta">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[#F8FAFC] rounded-[2rem] overflow-hidden border border-(--color-border-light) shadow-(--shadow-sm) flex flex-col md:flex-row items-stretch">
            {/* Left Image */}
            <div className="w-full md:w-[35%] lg:w-[30%] min-h-[240px] relative bg-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80" alt="Car owner" className="absolute inset-0 w-full h-full object-cover" />
            </div>
            {/* Right Content */}
            <div className="w-full md:w-[65%] lg:w-[70%] p-8 lg:p-10 flex flex-col justify-center">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 mb-8">
                <div>
                  <h2 className="text-2xl lg:text-[2rem] font-bold text-(--color-text-heading) leading-tight mb-3">
                    Own a car? Start earning from it.
                  </h2>
                  <p className="text-[1rem] text-(--color-text-muted) leading-relaxed max-w-xl">
                    List your car, set your rental price, choose with-driver or without-driver options, and let our admin team help manage rental requests.
                  </p>
                </div>
                <div className="shrink-0 lg:mt-2">
                  <Link href="/dashboard/owner/listings/new" className="inline-flex items-center justify-center gap-2 bg-(--color-primary) hover:bg-(--color-primary-hover) text-white font-semibold py-3.5 px-8 rounded-xl transition-colors shadow-md w-full lg:w-auto whitespace-nowrap">
                    List Your Car Now
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </Link>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 lg:gap-8 pt-6 border-t border-(--color-border-light)">
                <div className="flex items-center gap-2 text-[0.875rem] text-(--color-text-heading) font-medium">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><polyline points="20 6 9 17 4 12"/></svg>
                  Free basic listing
                </div>
                <div className="flex items-center gap-2 text-[0.875rem] text-(--color-text-heading) font-medium">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><polyline points="20 6 9 17 4 12"/></svg>
                  Admin-reviewed requests
                </div>
                <div className="flex items-center gap-2 text-[0.875rem] text-(--color-text-heading) font-medium">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><polyline points="20 6 9 17 4 12"/></svg>
                  Flexible pricing
                </div>
                <div className="flex items-center gap-2 text-[0.875rem] text-(--color-text-heading) font-medium">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><polyline points="20 6 9 17 4 12"/></svg>
                  With or without driver
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Locations */}
      <section className="py-12 lg:py-16 bg-(--color-surface-alt)" id="popular-locations">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-6 lg:mb-8">
            <h2 className="text-[1.25rem] lg:text-[1.5rem] font-bold text-(--color-text-heading)">Popular Locations</h2>
            <Link href="/cars" className="hidden sm:flex items-center gap-1 font-semibold text-(--color-primary) hover:underline text-[0.9375rem]">
              View all locations <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </Link>
          </div>

          <div className="flex flex-wrap gap-3 lg:gap-4">
            {["Addis Ababa", "Bole", "CMC", "Megenagna", "Kazanchis", "Ayat", "Sarbet", "Piassa"].map((loc) => (
              <Link 
                key={loc}
                href={`/cars?location=${encodeURIComponent(loc)}`}
                className="px-6 py-3 bg-white border border-(--color-border) hover:border-(--color-primary) rounded-2xl text-[0.9375rem] font-semibold text-(--color-text-heading) hover:text-(--color-primary) shadow-sm hover:shadow-md transition-all flex items-center gap-2"
              >
                {loc}
              </Link>
            ))}
          </div>
          
          <div className="mt-6 sm:hidden">
            <Link href="/cars" className="block w-full text-center py-3 bg-white border border-(--color-border) rounded-xl text-[0.875rem] font-semibold text-(--color-text-heading) shadow-sm">
              View all locations
            </Link>
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
