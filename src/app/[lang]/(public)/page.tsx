import { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import BrowseByCategorySection from "@/components/home/BrowseByCategorySection";
import { FeaturedListingsSection } from "@/components/listings/FeaturedListingsSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import DualCTASection from "@/components/home/DualCTASection";
import TrustAndSafetySection from "@/components/home/TrustAndSafetySection";
import PopularAndSearchedSection from "@/components/home/PopularAndSearchedSection";
import WhyChooseSection from "@/components/home/WhyChooseSection";
import { COMMISSION_COPY } from "@/lib/commission";
import { getDictionary, hasLocale } from "../dictionaries";
import type { Locale } from "../dictionaries";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "MyEthioProperties — Trusted Properties & Cars Across Ethiopia",
  description: `Ethiopia's trusted marketplace for verified properties and cars. Rent, buy, and list with admin-reviewed safety and transparent pricing — ${COMMISSION_COPY.meta}`,
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang as Locale);

  return (
    <>
      <HeroSection dict={dict.hero} lang={lang} />
      <FeaturedListingsSection dict={dict.featured} lang={lang} />
      <BrowseByCategorySection dict={dict.browseCategory} lang={lang} />
      <HowItWorksSection dict={dict.howItWorks} />
      <DualCTASection dict={dict.dualCta} lang={lang} />
      <TrustAndSafetySection dict={dict.trustSafety} />
      <PopularAndSearchedSection dict={dict.popularSearched} lang={lang} />
      <WhyChooseSection dict={dict.whyChoose} />
    </>
  );
}
