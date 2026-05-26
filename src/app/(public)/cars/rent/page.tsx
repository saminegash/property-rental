import { Metadata } from "next";
import BrowseCarsPage from "../page";

export const metadata: Metadata = {
  title: "Cars for Rent in Ethiopia | MyEthioProperties",
  description: "Browse verified cars for rent in Ethiopia. Find the perfect rental car for your needs with flexible terms.",
  alternates: { canonical: "https://myproperties.kodetechnologies.co/cars/rent" }
};

export default async function CarsRentRoute(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await props.searchParams;
  const mergedParams = Promise.resolve({
    ...params,
    listing_type: "rent",
    forceFilters: true,
    seoTitle: "Cars for Rent in Ethiopia",
    seoSubtitle: "Find the perfect rental car for your needs with flexible terms."
  });
  return <BrowseCarsPage searchParams={mergedParams} />;
}
