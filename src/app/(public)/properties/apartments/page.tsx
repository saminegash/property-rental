import { Metadata } from "next";
import BrowsePropertiesPage from "../page";

export const metadata: Metadata = {
  title: "Apartments for Rent and Sale in Ethiopia | MyProperties",
  description: "Browse verified apartments in Ethiopia. Find your perfect flat from our curated real estate listings.",
  alternates: { canonical: "https://myproperties.kodetechnologies.co/properties/apartments" }
};

export default async function PropertiesApartmentsRoute(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await props.searchParams;
  const mergedParams = Promise.resolve({
    ...params,
    property_type: "Apartment",
    forceFilters: true,
    seoTitle: "Apartments in Ethiopia",
    seoSubtitle: "Find your perfect apartment from our curated real estate listings."
  });
  return <BrowsePropertiesPage searchParams={mergedParams} />;
}
