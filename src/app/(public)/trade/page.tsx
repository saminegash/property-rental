import { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { ListingsGrid } from "@/components/listings/ListingsGrid";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Buy in Ethiopia — Properties & Cars for Sale | MyEthioProperties",
  description:
    "Buy verified properties and cars across Ethiopia in one place. Apartments, villas, land, and vehicles for sale — all admin-reviewed with transparent, negotiable pricing.",
};

function BuyHero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-blue-700 to-blue-900 py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Buy Property &amp; Cars in Ethiopia
          </h1>
          <p className="mt-4 text-base text-blue-100 sm:text-lg">
            One trusted marketplace for verified homes, land, and vehicles for
            sale. Every listing is admin-reviewed. No payment until you and the
            owner agree.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#cars"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-blue-700 shadow-md transition-all hover:shadow-lg"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              Browse Cars for Sale
            </Link>
            <Link
              href="#apartments"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/40 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-white/10"
            >
              Browse Properties for Sale
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function BuyPage() {
  return (
    <>
      <BuyHero />

      {/* 1. Top mixed featured-for-sale */}
      <ListingsGrid
        title="Featured for Sale"
        subtitle="Hand-picked properties and vehicles for sale across Ethiopia."
        listingType="sale"
        viewAllHref="/trade"
        anchorId="featured-sale"
        background="slate"
      />

      {/* 2. Cars */}
      <ListingsGrid
        title="Cars for Sale"
        subtitle="Sedans, SUVs and more from verified sellers."
        propertyType="vehicle"
        listingType="sale"
        viewAllHref="/trade?property_type=vehicle"
        anchorId="cars"
        background="white"
      />

      {/* 3. Apartments */}
      <ListingsGrid
        title="Apartments for Sale"
        subtitle="Modern apartment units across Ethiopia."
        propertyType="apartment"
        listingType="sale"
        viewAllHref="/trade?property_type=apartment"
        anchorId="apartments"
        background="slate"
      />

      {/* 4. Houses */}
      <ListingsGrid
        title="Houses for Sale"
        subtitle="Comfortable homes for families."
        propertyType="house"
        listingType="sale"
        viewAllHref="/trade?property_type=house"
        anchorId="houses"
        background="white"
      />

      {/* 5. Villas */}
      <ListingsGrid
        title="Villas for Sale"
        subtitle="Luxury villas with premium living."
        propertyType="villa"
        listingType="sale"
        viewAllHref="/trade?property_type=villa"
        anchorId="villas"
        background="slate"
      />

      {/* 6. Land */}
      <ListingsGrid
        title="Land for Sale"
        subtitle="Residential and commercial land across Ethiopia."
        propertyType="land"
        listingType="sale"
        viewAllHref="/trade?property_type=land"
        anchorId="land"
        background="white"
      />

      {/* 7. Commercial */}
      <ListingsGrid
        title="Commercial for Sale"
        subtitle="Offices, shops and commercial spaces."
        propertyType="commercial"
        listingType="sale"
        viewAllHref="/trade?property_type=commercial"
        anchorId="commercial"
        background="slate"
      />
    </>
  );
}
