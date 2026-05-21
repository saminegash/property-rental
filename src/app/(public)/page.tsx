import { MarketplaceHeroSection } from "@/components/shared/MarketplaceHeroSection";
import { FeaturedCarsSection } from "@/components/cars/FeaturedCarsSection";
import { FeaturedPropertiesSection } from "@/components/properties/FeaturedPropertiesSection";
import { CarCategoriesSection } from "@/components/cars/CarCategoriesSection";
import { TrustFeaturesSection } from "@/components/cars/TrustFeaturesSection";
import { HowItWorksSection } from "@/components/cars/HowItWorksSection";
import { PricingTransparencySection } from "@/components/cars/PricingTransparencySection";
import { OwnerCTASection } from "@/components/cars/OwnerCTASection";
import { PopularLocationsSection } from "@/components/cars/PopularLocationsSection";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "MyEthioProperties — Rent, Buy & Sell Cars and Properties with Trust",
  description: "Ethiopia's verified marketplace for cars and properties. Transparent pricing, admin-reviewed listings, and secure transactions.",
};

export default function HomePage() {
  return (
    <>
      {/* Generic Marketplace Hero */}
      <MarketplaceHeroSection />

      {/* Featured Cars */}
      <FeaturedCarsSection />

      {/* Featured Properties */}
      <FeaturedPropertiesSection />

      {/* Browse by Car Category */}
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
