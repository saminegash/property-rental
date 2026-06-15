import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import { RequestForm } from "./RequestForm";
import type { ListingDetails } from "@/lib/format";
import type { Enums } from "@/lib/supabase/database.types";
import {
  MapPin,
  BedDouble,
  Bath,
  Square,
  Calendar,
  CheckCircle,
} from "lucide-react";
import ListingGallery from "@/components/listings/ListingGallery";

export const dynamic = "force-dynamic";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch listing details
  const { data: listing } = await supabase
    .from("listings")
    .select(
      `
      id, owner_id, title, description, property_type, listing_type,
      price, currency, city, sub_city, location_detail, 
      bedrooms, bathrooms, area_sqm, details, status, is_featured
      `,
    )
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  const VIEWABLE: Enums<"listing_status">[] = [
    "published",
    "reserved",
    "rented",
    "sold",
  ];
  if (!listing || !VIEWABLE.includes(listing.status)) {
    notFound();
  }
  const isClosed = listing.status === "rented" || listing.status === "sold";
  const isReserved = listing.status === "reserved";

  // 2. Fetch images
  const { data: images } = await supabase
    .from("listing_images")
    .select("image_url, is_primary")
    .eq("listing_id", id)
    .order("sort_order", { ascending: true })
    .order("is_primary", { ascending: false });

  // 3. Fetch owner profile (for verification status and business name)
  const { data: ownerProfile } = await supabase
    .from("profiles")
    .select("full_name, business_name, verification_status")
    .eq("user_id", listing.owner_id)
    .single();

  const isVerified = ownerProfile?.verification_status === "verified";

  const locationStr = [listing.location_detail, listing.sub_city, listing.city]
    .filter(Boolean)
    .join(", ");

  const details = listing.details as ListingDetails;

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Breadcrumb & Top actions */}
        <div className="mb-6 flex items-center justify-between">
          <nav className="text-sm font-medium text-slate-500">
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>
            <span className="mx-2">›</span>
            <Link
              href={`/${listing.listing_type === "rent" ? "rent" : "trade"}`}
              className="hover:text-blue-600 capitalize"
            >
              {listing.listing_type}
            </Link>
            <span className="mx-2">›</span>
            <span className="text-slate-900 capitalize">
              {listing.property_type}
            </span>
          </nav>
        </div>

        {/* Title Section */}
        <div className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 capitalize">
                  For {listing.listing_type}
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-800 capitalize">
                  {listing.property_type}
                </span>
                {listing.is_featured && (
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                    ★ Featured
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {listing.title}
              </h1>
              <p className="mt-2 flex items-center text-slate-600">
                <MapPin className="mr-1.5 h-4 w-4 shrink-0 text-slate-400" />
                {locationStr}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold text-blue-600">
                {formatCurrency(listing.price, listing.currency)}
                {listing.listing_type === "rent" && (
                  <span className="text-base font-normal text-slate-500">
                    {" "}
                    / month
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="mb-10">
          <ListingGallery
            images={images || []}
            title={listing.title}
          />
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Main Content (Left, 2 columns) */}
          <div className="lg:col-span-2 space-y-10">
            {/* Owner Section */}
            <div className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 overflow-hidden rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">
                  {(
                    ownerProfile?.business_name ||
                    ownerProfile?.full_name ||
                    "O"
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-slate-500">Listed by</p>
                  <p className="font-semibold text-slate-900 text-lg flex items-center gap-2">
                    {ownerProfile?.business_name ||
                      ownerProfile?.full_name ||
                      "Owner"}
                    {isVerified && (
                      <span className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                        <CheckCircle className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Overview / Specs */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Overview
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {listing.bedrooms != null && (
                  <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <BedDouble className="h-5 w-5 text-slate-400" />
                    <span className="font-semibold text-slate-900">
                      {listing.bedrooms}
                    </span>
                    <span className="text-xs text-slate-500">Bedrooms</span>
                  </div>
                )}
                {listing.bathrooms != null && (
                  <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <Bath className="h-5 w-5 text-slate-400" />
                    <span className="font-semibold text-slate-900">
                      {listing.bathrooms}
                    </span>
                    <span className="text-xs text-slate-500">Bathrooms</span>
                  </div>
                )}
                {listing.area_sqm != null && (
                  <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <Square className="h-5 w-5 text-slate-400" />
                    <span className="font-semibold text-slate-900">
                      {listing.area_sqm} m²
                    </span>
                    <span className="text-xs text-slate-500">Area</span>
                  </div>
                )}
                {details?.year_built != null && (
                  <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <Calendar className="h-5 w-5 text-slate-400" />
                    <span className="font-semibold text-slate-900">
                      {details.year_built}
                    </span>
                    <span className="text-xs text-slate-500">Year Built</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Description
              </h2>
              <div className="prose prose-slate max-w-none">
                {listing.description ? (
                  <p className="whitespace-pre-line text-slate-700">
                    {listing.description}
                  </p>
                ) : (
                  <p className="text-slate-500 italic">
                    No description provided.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar (Right, 1 column) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <RequestForm
                listingId={listing.id}
                listingType={listing.listing_type}
                propertyType={listing.property_type}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
