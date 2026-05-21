import { Metadata } from "next";
import BrowseCarsPage from "../page";

export const metadata: Metadata = {
  title: "Cars for Sale in Ethiopia | MyProperties",
  description: "Browse verified cars for sale in Ethiopia. Find your next vehicle from trusted sellers across the country.",
  alternates: { canonical: "https://myproperties.kodetechnologies.co/cars/sale" }
};

export default async function CarsSaleRoute(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await props.searchParams;
  const mergedParams = Promise.resolve({
    ...params,
    listing_type: "sale",
    forceFilters: true,
    seoTitle: "Cars for Sale in Ethiopia",
    seoSubtitle: "Find your next vehicle from trusted sellers across the country."
  });
  return <BrowseCarsPage searchParams={mergedParams} />;
}
