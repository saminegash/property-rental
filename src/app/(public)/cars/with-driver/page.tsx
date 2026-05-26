import { Metadata } from "next";
import BrowseCarsPage from "../page";

export const metadata: Metadata = {
  title: "Cars with Driver for Rent in Ethiopia | MyEthioProperties",
  description: "Browse rental cars available with a professional driver in Ethiopia. Sit back, relax, and enjoy the ride.",
  alternates: { canonical: "https://myproperties.kodetechnologies.co/cars/with-driver" }
};

export default async function CarsWithDriverRoute(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await props.searchParams;
  const mergedParams = Promise.resolve({
    ...params,
    driver: "with",
    forceFilters: true,
    seoTitle: "Cars with Driver in Ethiopia",
    seoSubtitle: "Sit back and relax with our professional driver options."
  });
  return <BrowseCarsPage searchParams={mergedParams} />;
}
