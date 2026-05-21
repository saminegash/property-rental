import { Metadata } from "next";
import BrowsePropertiesPage from "../page";

export const metadata: Metadata = {
  title: "Properties for Sale in Ethiopia | MyProperties",
  description: "Browse verified properties for sale in Ethiopia. Find the perfect real estate investment from trusted sellers.",
  alternates: { canonical: "https://myproperties.kodetechnologies.co/properties/sale" }
};

export default async function PropertiesSaleRoute(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await props.searchParams;
  const mergedParams = Promise.resolve({
    ...params,
    type: "sale",
    forceFilters: true,
    seoTitle: "Properties for Sale in Ethiopia",
    seoSubtitle: "Find the perfect real estate investment from trusted sellers."
  });
  return <BrowsePropertiesPage searchParams={mergedParams} />;
}
