import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "bonum.mn",
      },
      {
        protocol: "https",
        hostname: "qpay.mn",
      },
      {
        protocol: "https",
        hostname: "s3.qpay.mn",
      },
    ],
  },
};

export default nextConfig;
