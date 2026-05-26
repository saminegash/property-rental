import { Metadata } from "next";
import BrowsePropertiesPage from "../page";

export const metadata: Metadata = {
  title: "Houses for Rent and Sale in Ethiopia | MyEthioProperties",
  description: "Browse verified houses in Ethiopia. Find the perfect home for your family from trusted owners.",
  alternates: { canonical: "https://myproperties.kodetechnologies.co/properties/houses" }
};

export default async function PropertiesHousesRoute(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await props.searchParams;
  const mergedParams = Promise.resolve({
    ...params,
    // "House" isn't explicitly in the PROPERTY_TYPES array, but "Villa" and "Guest House" are. 
    // We'll map this generally to a search query or rely on a generic property search.
    // For now, we leave property_type empty but set seo parameters.
    forceFilters: true,
    seoTitle: "Houses in Ethiopia",
    seoSubtitle: "Find the perfect home for your family from trusted owners."
  });
  return <BrowsePropertiesPage searchParams={mergedParams} />;
}
