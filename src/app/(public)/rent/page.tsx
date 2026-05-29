import { Metadata } from "next";
import RentHeroSection from "@/components/rent/RentHeroSection";
import { RentalListingsSection } from "@/components/rent/RentalListingsSection";
import RentalProcessSection from "@/components/rent/RentalProcessSection";
import RentalPricingTransparencySection from "@/components/rent/RentalPricingTransparencySection";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rent Properties in Ethiopia — Verified Listings | MyEthioProperties",
  description:
    "Find verified rental properties across Ethiopia. Apartments, houses, villas, condos — all admin-reviewed with transparent pricing and no upfront fees.",
};

export default async function RentPage() {
  // Pre-fetch property types for the hero dropdownp
  const supabase = await createClient();
  const { data: propertyTypes } = await supabase
    .from("property_types")
    .select("id, name")
    .order("name");

  return (
    <>
      {/* Hero with big blue search panel */}
      <RentHeroSection propertyTypes={propertyTypes || []} />

      {/* Featured Rental Properties */}
      <RentalListingsSection
        title="Featured Rental Properties"
        subtitle="Hand-picked verified rentals — ready to move in."
        featuredOnly
        limit={5}
        background="white"
      />

      {/* Rental Process (5 steps) */}
      <RentalProcessSection />

      {/* Apartment Rentals */}
      <RentalListingsSection
        title="Apartment Rentals"
        subtitle="Modern apartments across Addis Ababa and beyond."
        propertyTypeName="Apartment"
        viewAllHref="/properties?listing_type=rent&property_type=apartment"
        limit={5}
        background="slate"
      />

      {/* Condominium Rentals */}
      <RentalListingsSection
        title="Condominium Rentals"
        subtitle="Comfortable condo living, fully verified."
        propertyTypeName="Condominium"
        viewAllHref="/properties?listing_type=rent&property_type=condominium"
        limit={5}
        background="white"
      />

      {/* House Rentals */}
      <RentalListingsSection
        title="House Rentals"
        subtitle="Spacious homes perfect for families."
        propertyTypeName="House"
        viewAllHref="/properties?listing_type=rent&property_type=house"
        limit={5}
        background="slate"
      />

      {/* Pricing Transparency */}
      <RentalPricingTransparencySection />
    </>
  );
}
