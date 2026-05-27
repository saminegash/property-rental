import { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import BrowseByCategorySection from "@/components/home/BrowseByCategorySection";
import { FeaturedPropertiesSection } from "@/components/home/FeaturedPropertiesSection";
import { FeaturedCarsSection } from "@/components/home/FeaturedCarsSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import DualCTASection from "@/components/home/DualCTASection";
import TrustAndSafetySection from "@/components/home/TrustAndSafetySection";
import PopularAndSearchedSection from "@/components/home/PopularAndSearchedSection";
import WhyChooseSection from "@/components/home/WhyChooseSection";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "MyEthioProperties — Trusted Properties & Cars Across Ethiopia",
  description:
    "Ethiopia's trusted marketplace for verified properties and cars. Rent, buy, and list with admin-reviewed safety, transparent process, and only 5% commission after a successful deal.",
};

export default async function HomePage() {
  // Fetch property types once for the hero dropdown
  const supabase = await createClient();
  const { data: propertyTypes } = await supabase
    .from("property_types")
    .select("id, name")
    .order("name");

  return (
    <>
      <HeroSection propertyTypes={propertyTypes || []} />
      <BrowseByCategorySection />
      <FeaturedPropertiesSection />
      <FeaturedCarsSection />
      <HowItWorksSection />
      <DualCTASection />
      <TrustAndSafetySection />
      <PopularAndSearchedSection />
      <WhyChooseSection />
    </>
  );
}
