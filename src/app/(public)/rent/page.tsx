import { Metadata } from "next";
import { GenericListingsSection } from "@/components/listings/GenericListingsSection";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rent Properties in Ethiopia — Verified Listings | MyEthioProperties",
  description:
    "Find verified rental properties across Ethiopia. Apartments, houses, villas, condos — all admin-reviewed with transparent pricing and no upfront fees.",
};

function RentHero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-blue-700 to-blue-900 py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Rent Property &amp; Cars in Ethiopia
          </h1>
          <p className="mt-4 text-base text-blue-100 sm:text-lg">
            One trusted marketplace for verified homes and vehicles for
            rent. Every listing is admin-reviewed.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function RentPage() {
  return (
    <>
      <RentHero />
      <GenericListingsSection
        title="Properties & Cars for Rent"
        subtitle="Verified homes and vehicles — priority listings first."
        listingType="rent"
      />
    </>
  );
}
