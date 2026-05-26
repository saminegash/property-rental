import { Metadata } from "next";
import BrowseCarsPage from "../page";

export const metadata: Metadata = {
  title: "Self-Drive Cars for Rent in Ethiopia | MyEthioProperties",
  description: "Browse self-drive rental cars in Ethiopia. Get behind the wheel and explore at your own pace.",
  alternates: { canonical: "https://myproperties.kodetechnologies.co/cars/without-driver" }
};

export default async function CarsWithoutDriverRoute(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await props.searchParams;
  const mergedParams = Promise.resolve({
    ...params,
    driver: "without",
    forceFilters: true,
    seoTitle: "Self-Drive Cars in Ethiopia",
    seoSubtitle: "Get behind the wheel and explore at your own pace."
  });
  return <BrowseCarsPage searchParams={mergedParams} />;
}
