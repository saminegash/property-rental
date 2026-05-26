import { Metadata } from "next";
import BrowsePropertiesPage from "../page";

export const metadata: Metadata = {
  title: "Properties for Rent in Ethiopia | MyEthioProperties",
  description: "Browse verified apartments, houses, and commercial spaces for rent in Ethiopia. Find your next rental property today.",
  alternates: { canonical: "https://myproperties.kodetechnologies.co/properties/rent" }
};

export default async function PropertiesRentRoute(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await props.searchParams;
  const mergedParams = Promise.resolve({
    ...params,
    type: "rent",
    forceFilters: true,
    seoTitle: "Properties for Rent in Ethiopia",
    seoSubtitle: "Find your next rental home or commercial space from trusted owners."
  });
  return <BrowsePropertiesPage searchParams={mergedParams} />;
}
