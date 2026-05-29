import { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import BrowseByCategorySection from "@/components/home/BrowseByCategorySection";
import { FeaturedListingsSection } from "@/components/listings/FeaturedListingsSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import DualCTASection from "@/components/home/DualCTASection";
import TrustAndSafetySection from "@/components/home/TrustAndSafetySection";
import PopularAndSearchedSection from "@/components/home/PopularAndSearchedSection";
import WhyChooseSection from "@/components/home/WhyChooseSection";


export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "MyEthioProperties — Trusted Properties & Cars Across Ethiopia",
  description:
    "Ethiopia's trusted marketplace for verified properties and cars. Rent, buy, and list with admin-reviewed safety, transparent process, and only 5% commission after a successful deal.",
};

export default async function HomePage() {
  return (
    <>
      <HeroSection />
      <BrowseByCategorySection />
      <FeaturedListingsSection />
      <HowItWorksSection />
      <DualCTASection />
      <TrustAndSafetySection />
      <PopularAndSearchedSection />
      <WhyChooseSection />
    </>
  );
}
