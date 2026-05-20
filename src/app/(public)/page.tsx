import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PropertyListingCard } from "@/components/properties/PropertyListingCard";
import { CarHeroSection } from "@/components/cars/CarHeroSection";
import { FeaturedCarsSection } from "@/components/cars/FeaturedCarsSection";
import { CarCategoriesSection } from "@/components/cars/CarCategoriesSection";
import { TrustFeaturesSection } from "@/components/cars/TrustFeaturesSection";
import { HowItWorksSection } from "@/components/cars/HowItWorksSection";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "MyProperties - Rent verified cars with or without a driver",
  description: "Find trusted cars, request rentals, and get your car delivered within hours or days. Verified owners. Transparent pricing.",
};

interface PropertyListing {
  id: string;
  title: string;
  location: string | null;
  property_details?: {
    bedrooms: number;
    bathrooms: number;
    area_sqm: number;
  };
  rental_terms?: {
    daily_price: number | null; // using as monthly price for properties in this MVP
  };
  sale_terms?: {
    price: number | null;
  };
  listing_images?: Array<{ image_url: string; is_primary: boolean }>;
  listing_type: "rent" | "sale";
}

export default async function HomePage() {
  const supabase = await createClient();
  
  // Try fetching properties
  const { data: listings } = await supabase
    .from("listings")
    .select(`
      id, title, location, listing_type,
      property_details:attributes,
      rental_terms ( daily_price ),
      listing_images ( image_url, is_primary )
    `)
    .eq("category", "property")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(4);

  // Fallback data if no properties exist
  const fallbackProperties: PropertyListing[] = [
    {
      id: "prop-1",
      title: "Bole Modern Apartment",
      location: "Bole, Addis Ababa",
      listing_type: "rent",
      property_details: { bedrooms: 2, bathrooms: 2, area_sqm: 120 },
      rental_terms: { daily_price: 45000 },
      listing_images: [{ image_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80", is_primary: true }],
    },
    {
      id: "prop-2",
      title: "Luxury Villa in Sarbet",
      location: "Sarbet, Addis Ababa",
      listing_type: "sale",
      property_details: { bedrooms: 5, bathrooms: 4, area_sqm: 350 },
      rental_terms: { daily_price: 23500000 }, // using rental_terms for mock price
      listing_images: [{ image_url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80", is_primary: true }],
    },
    {
      id: "prop-3",
      title: "CMC Premium Condo",
      location: "CMC, Addis Ababa",
      listing_type: "rent",
      property_details: { bedrooms: 3, bathrooms: 2, area_sqm: 150 },
      rental_terms: { daily_price: 60000 },
      listing_images: [{ image_url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80", is_primary: true }],
    },
    {
      id: "prop-4",
      title: "Bole Office Center",
      location: "Bole, Addis Ababa",
      listing_type: "sale",
      property_details: { bedrooms: 0, bathrooms: 2, area_sqm: 800 },
      rental_terms: { daily_price: 35000000 },
      listing_images: [{ image_url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80", is_primary: true }],
    }
  ];

  const featuredListings: PropertyListing[] = listings && listings.length > 0 ? (listings as unknown as PropertyListing[]) : fallbackProperties;

  return (
    <>
      {/* Car Hero Section */}
      <CarHeroSection />

      {/* Featured Cars */}
      <FeaturedCarsSection />

      {/* Browse by Category */}
      <CarCategoriesSection />

      {/* Trust Features */}
      <TrustFeaturesSection />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Featured Properties */}
      <section className="py-16 lg:py-24 bg-surface-alt border-b border-border-light">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-text-heading mb-1">Featured Properties</h2>
              <p className="text-text-muted">Handpicked verified properties just for you</p>
            </div>
            <Link href="/properties" className="hidden sm:block text-sm font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>

          <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 lg:grid lg:grid-cols-4 lg:gap-6 lg:pb-0 lg:overflow-visible" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {featuredListings.map((prop: PropertyListing) => {
              const details = prop.property_details || { bedrooms: 0, bathrooms: 0, area_sqm: 0 };
              const price = prop.rental_terms?.daily_price || prop.sale_terms?.price || 0;
              const coverImg = prop.listing_images?.find((img) => img.is_primary)?.image_url || prop.listing_images?.[0]?.image_url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80";

              return (
                <PropertyListingCard
                  key={prop.id}
                  id={prop.id}
                  title={prop.title}
                  location={prop.location || "Addis Ababa"}
                  image={coverImg}
                  price={price}
                  type={prop.listing_type === "sale" ? "buy" : "rent"}
                  beds={details.bedrooms || 0}
                  baths={details.bathrooms || 0}
                  area={details.area_sqm || 0}
                  isVerified={true}
                  isFeatured={true}
                  href={`/properties/${prop.id}`}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-10 bg-white border-b border-border-light">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-start gap-4 p-4">
            <div className="shrink-0 w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div>
              <h3 className="font-bold text-sm text-text-heading mb-1">Verified Listings</h3>
              <p className="text-xs text-text-muted">Every property is verified for your peace of mind.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4">
            <div className="shrink-0 w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>
              <h3 className="font-bold text-sm text-text-heading mb-1">Admin-reviewed Requests</h3>
              <p className="text-xs text-text-muted">All requests are reviewed to ensure safety.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4">
            <div className="shrink-0 w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </div>
            <div>
              <h3 className="font-bold text-sm text-text-heading mb-1">Multilingual Support</h3>
              <p className="text-xs text-text-muted">EN / አማ / OM - Built for Ethiopia, ready for the world.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4">
            <div className="shrink-0 w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            </div>
            <div>
              <h3 className="font-bold text-sm text-text-heading mb-1">Transparent Pricing</h3>
              <p className="text-xs text-text-muted">No hidden fees. What you see is what you pay.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works & Market Insights */}
      <section className="py-16 lg:py-24 bg-surface-alt border-b border-border-light">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-12">
          
          {/* How It Works */}
          <div>
            <h2 className="text-2xl font-bold text-text-heading mb-2">How it works</h2>
            <p className="text-sm text-text-muted mb-8">Find, request & move in — in a few simple steps</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-border">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm mb-3">1</div>
                <h3 className="font-bold text-sm text-text-heading mb-1">Search</h3>
                <p className="text-xs text-text-muted leading-relaxed">Use smart search to find the right property.</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-border">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm mb-3">2</div>
                <h3 className="font-bold text-sm text-text-heading mb-1">Request</h3>
                <p className="text-xs text-text-muted leading-relaxed">Send a request or message the owner or agent.</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-border">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm mb-3">3</div>
                <h3 className="font-bold text-sm text-text-heading mb-1">Review</h3>
                <p className="text-xs text-text-muted leading-relaxed">We review requests and connect you safely.</p>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-border">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm mb-3">4</div>
                <h3 className="font-bold text-sm text-text-heading mb-1">Move In</h3>
                <p className="text-xs text-text-muted leading-relaxed">Close the deal and move in with confidence.</p>
              </div>
            </div>
          </div>

          {/* Market Insights */}
          <div>
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl font-bold text-text-heading mb-2">Addis Ababa Market Insights</h2>
                <p className="text-sm text-text-muted">Stay informed. Make smarter decisions.</p>
              </div>
              <Link href="/insights" className="text-sm font-semibold text-primary hover:underline mb-1">
                View report
              </Link>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-border flex flex-col justify-between">
                  <p className="text-xs text-text-muted mb-2">Avg. Rent (2BR)</p>
                  <div className="font-bold text-lg text-text-heading mb-1">ETB 46K</div>
                  <div className="text-[10px] font-bold text-success flex items-center gap-1">↑ 8.5% <span className="text-text-muted font-normal">vs last yr</span></div>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-border flex flex-col justify-between">
                  <p className="text-xs text-text-muted mb-2">Avg. Sale Price</p>
                  <div className="font-bold text-lg text-text-heading mb-1">ETB 12.4M</div>
                  <div className="text-[10px] font-bold text-success flex items-center gap-1">↑ 6.2% <span className="text-text-muted font-normal">vs last yr</span></div>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-border flex flex-col justify-between">
                  <p className="text-xs text-text-muted mb-2">Active Listings</p>
                  <div className="font-bold text-lg text-text-heading mb-1">5,230</div>
                  <div className="text-[10px] font-bold text-success flex items-center gap-1">↑ 12.3% <span className="text-text-muted font-normal">new this mo</span></div>
                </div>
              </div>
              
              <div className="bg-slate-200 rounded-2xl h-[140px] relative overflow-hidden flex items-center justify-center border border-border">
                {/* Fake map placeholder */}
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-blue-100 via-slate-200 to-slate-300"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-1.5 rounded-lg shadow-md text-xs font-bold text-primary flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  Bole: High demand
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-primary text-white py-16" id="cta-banner">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to find your perfect place?</h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">Join thousands of users who have found their dream homes and investments on MyProperties.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/properties" className="bg-white text-primary font-bold py-3.5 px-8 rounded-xl shadow-md hover:bg-slate-50 transition-colors">
              Browse Properties
            </Link>
            <Link href="/dashboard/owner/listings/new" className="bg-transparent border-2 border-white/30 hover:border-white text-white font-bold py-3.5 px-8 rounded-xl transition-colors">
              List Your Property
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
