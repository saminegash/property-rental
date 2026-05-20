import { CarHeroSection } from "@/components/cars/CarHeroSection";
import { FeaturedCarsSection } from "@/components/cars/FeaturedCarsSection";
import { CarCategoriesSection } from "@/components/cars/CarCategoriesSection";
import { TrustFeaturesSection } from "@/components/cars/TrustFeaturesSection";
import { HowItWorksSection } from "@/components/cars/HowItWorksSection";
import { PricingTransparencySection } from "@/components/cars/PricingTransparencySection";
import { OwnerCTASection } from "@/components/cars/OwnerCTASection";
import { PopularLocationsSection } from "@/components/cars/PopularLocationsSection";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "MyProperties - Rent verified cars with or without a driver",
  description: "Find trusted cars, request rentals, and get your car delivered within hours or days. Verified owners. Transparent pricing.",
};

export default function HomePage() {
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

      {/* Pricing Transparency */}
      <PricingTransparencySection />

      {/* Popular Locations */}
      <PopularLocationsSection />

      {/* Owner CTA */}
      <OwnerCTASection />
    </>
  );
}


