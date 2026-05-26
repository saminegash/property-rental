import { Metadata } from "next";
import BrowsePropertiesPage from "../page";

export const metadata: Metadata = {
  title: "Land for Sale in Ethiopia | MyEthioProperties",
  description: "Browse verified land plots for sale in Ethiopia. Find the perfect plot for your next construction project or investment.",
  alternates: { canonical: "https://myproperties.kodetechnologies.co/properties/land" }
};

export default async function PropertiesLandRoute(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await props.searchParams;
  const mergedParams = Promise.resolve({
    ...params,
    property_type: "Land",
    forceFilters: true,
    seoTitle: "Land in Ethiopia",
    seoSubtitle: "Find the perfect plot for your next project or investment."
  });
  return <BrowsePropertiesPage searchParams={mergedParams} />;
}
