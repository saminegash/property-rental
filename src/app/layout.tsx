import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://myethioproperties.com"),
  title: "MyEthioProperties — Real Estate & Verified Rentals in Ethiopia",
  description:
    "Ethiopia's trusted marketplace. Find verified apartments, houses, villas, land, and vehicles for rent or purchase with guaranteed security.",
  icons: {
    icon: "/logo.webp",
  },
  openGraph: {
    title: "MyEthioProperties — Real Estate & Verified Rentals in Ethiopia",
    description:
      "Ethiopia's trusted marketplace. Find verified apartments, houses, villas, land, and vehicles for rent or purchase.",
    url: "https://myethioproperties.com",
    siteName: "MyEthioProperties",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "MyEthioProperties",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyEthioProperties — Real Estate & Verified Rentals",
    description: "Ethiopia's trusted property marketplace.",
    images: ["/opengraph-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
