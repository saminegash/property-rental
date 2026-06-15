import { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { ListingsGrid } from "@/components/listings/ListingsGrid";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rent Properties in Ethiopia — Verified Listings | MyEthioProperties",
  description:
    "Find verified rental properties and cars across Ethiopia. Apartments, houses, villas, land, commercial spaces and vehicles — all admin-reviewed with transparent pricing and no upfront fees.",
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
            One trusted marketplace for verified homes and vehicles for rent.
            Every listing is admin-reviewed.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#cars"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-blue-700 shadow-md transition-all hover:shadow-lg"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Browse Cars for Rent
            </Link>
            <Link
              href="#apartments"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-white/10"
            >
              Browse Properties for Rent
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function RentPage() {
  return (
    <>
      <RentHero />

      {/* 1. Top mixed featured-for-rent */}
      <ListingsGrid
        title="Featured for Rent"
        subtitle="Hand-picked properties and vehicles for rent across Ethiopia."
        listingType="rent"
        viewAllHref="/rent"
        anchorId="featured-rent"
        background="slate"
      />

      {/* 2. Cars */}
      <ListingsGrid
        title="Cars for Rent"
        subtitle="Sedans, SUVs and more from verified owners."
        propertyType="vehicle"
        listingType="rent"
        viewAllHref="/rent?property_type=vehicle"
        anchorId="cars"
        background="white"
      />

      {/* 3. Apartments */}
      <ListingsGrid
        title="Apartments for Rent"
        subtitle="Modern apartment units across Ethiopia."
        propertyType="apartment"
        listingType="rent"
        viewAllHref="/rent?property_type=apartment"
        anchorId="apartments"
        background="slate"
      />

      {/* 4. Houses */}
      <ListingsGrid
        title="Houses for Rent"
        subtitle="Comfortable homes for families."
        propertyType="house"
        listingType="rent"
        viewAllHref="/rent?property_type=house"
        anchorId="houses"
        background="white"
      />

      {/* 5. Villas */}
      <ListingsGrid
        title="Villas for Rent"
        subtitle="Luxury villas with premium living."
        propertyType="villa"
        listingType="rent"
        viewAllHref="/rent?property_type=villa"
        anchorId="villas"
        background="slate"
      />

      {/* 6. Land */}
      <ListingsGrid
        title="Land for Rent"
        subtitle="Plots and parcels available to lease."
        propertyType="land"
        listingType="rent"
        viewAllHref="/rent?property_type=land"
        anchorId="land"
        background="white"
      />

      {/* 7. Commercial */}
      <ListingsGrid
        title="Commercial for Rent"
        subtitle="Offices, shops and commercial spaces to lease."
        propertyType="commercial"
        listingType="rent"
        viewAllHref="/rent?property_type=commercial"
        anchorId="commercial"
        background="slate"
      />
    </>
  );
}
