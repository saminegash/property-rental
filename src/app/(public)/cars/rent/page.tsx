import { Metadata } from "next";
import CarRentalHeroSection from "@/components/cars/rent/CarRentalHeroSection";
import { CarRentalListingsSection } from "@/components/cars/rent/CarRentalListingsSection";
import CarRentalProcessSection from "@/components/cars/rent/CarRentalProcessSection";
import CarRentalPricingTransparencySection from "@/components/cars/rent/CarRentalPricingTransparencySection";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rent a Car in Ethiopia — Verified Vehicles | MyEthioProperties",
  description:
    "Rent verified cars across Ethiopia — sedans, SUVs, vans, pickups, and luxury vehicles. With or without a driver. Admin-reviewed listings, transparent pricing.",
};

export default async function CarRentPage() {
  // Pre-fetch car brands for the hero dropdown — adjust if your table name differs
  const supabase = await createClient();
  const { data: carBrands } = await supabase
    .from("car_brands")
    .select("id, name")
    .order("name");

  return (
    <>
      {/* Hero with green search panel + driver toggle */}
      <CarRentalHeroSection carBrands={carBrands || []} />

      {/* Featured Rental Cars */}
      <CarRentalListingsSection
        title="Featured Rental Cars"
        subtitle="Hand-picked verified vehicles — ready to drive."
        featuredOnly
        limit={5}
        background="white"
      />

      {/* Process (5 steps) */}
      <CarRentalProcessSection />

      {/* Sedan */}
      <CarRentalListingsSection
        title="Sedan Rentals"
        subtitle="Comfortable everyday sedans for city driving."
        bodyType="sedan"
        viewAllHref="/cars?listing_type=rent&body_type=sedan"
        limit={5}
        background="slate"
      />

      {/* SUV */}
      <CarRentalListingsSection
        title="SUV Rentals"
        subtitle="Spacious SUVs for families and long trips."
        bodyType="suv"
        viewAllHref="/cars?listing_type=rent&body_type=suv"
        limit={5}
        background="white"
      />

      {/* Van */}
      <CarRentalListingsSection
        title="Van Rentals"
        subtitle="Large vans for groups and cargo."
        bodyType="van"
        viewAllHref="/cars?listing_type=rent&body_type=van"
        limit={5}
        background="slate"
      />

      {/* Pickup */}
      <CarRentalListingsSection
        title="Pickup Rentals"
        subtitle="Workhorse pickups for hauling and rough terrain."
        bodyType="pickup"
        viewAllHref="/cars?listing_type=rent&body_type=pickup"
        limit={5}
        background="white"
      />

      {/* Luxury */}
      <CarRentalListingsSection
        title="Luxury Rentals"
        subtitle="Premium vehicles for special occasions and executive travel."
        bodyType="luxury"
        viewAllHref="/cars?listing_type=rent&body_type=luxury"
        limit={5}
        background="slate"
      />

      {/* Pricing */}
      <CarRentalPricingTransparencySection />
    </>
  );
}
