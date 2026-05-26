import { MarketplaceHeroSection } from "@/components/shared/MarketplaceHeroSection";
import { FeaturedPropertiesSection } from "@/components/properties/FeaturedPropertiesSection";
import { PropertyCategoriesSection } from "@/components/properties/PropertyCategoriesSection";
import { TrustFeaturesSection } from "@/components/shared/TrustFeaturesSection";
import { HowItWorksSection } from "@/components/shared/HowItWorksSection";
import { PricingTransparencySection } from "@/components/shared/PricingTransparencySection";
import { PropertyOwnerCTASection } from "@/components/properties/PropertyOwnerCTASection";
import { PopularLocationsSection } from "@/components/shared/PopularLocationsSection";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "MyEthioProperties — Verified Properties for Rent & Sale",
  description: "Ethiopia's trusted property marketplace. Find verified apartments, houses, villas, and land. Transparent pricing, admin-reviewed listings, and secure transactions.",
};

export default function HomePage() {
  return (
    <>
      {/* Property-first Marketplace Hero */}
      <MarketplaceHeroSection />

      {/* Featured Properties */}
      <FeaturedPropertiesSection />

      {/* Browse by Property Category */}
      <PropertyCategoriesSection />

      {/* Trust Features */}
      <TrustFeaturesSection />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Pricing Transparency */}
      <PricingTransparencySection />

      {/* Popular Locations */}
      <PopularLocationsSection />

      {/* Property Owner CTA */}
      <PropertyOwnerCTASection />
    </>
  );
}
