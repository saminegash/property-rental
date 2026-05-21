import { Metadata } from "next";
import BrowsePropertiesPage from "../page";

export const metadata: Metadata = {
  title: "Villas for Rent and Sale in Ethiopia | MyProperties",
  description: "Browse luxury villas in Ethiopia. Find your dream home with premium amenities.",
  alternates: { canonical: "https://myproperties.kodetechnologies.co/properties/villas" }
};

export default async function PropertiesVillasRoute(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await props.searchParams;
  const mergedParams = Promise.resolve({
    ...params,
    property_type: "Villa",
    forceFilters: true,
    seoTitle: "Villas in Ethiopia",
    seoSubtitle: "Find your dream luxury home with premium amenities."
  });
  return <BrowsePropertiesPage searchParams={mergedParams} />;
}
