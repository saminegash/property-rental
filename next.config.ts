import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "drykgpakkwqlmgtafsks.supabase.co",
      },
    ],
  },
  serverActions: {
    bodySizeLimit: "50mb",
  },
};

export default nextConfig;
