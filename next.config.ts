import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "@wong1982-ops/handytool-ui",
      "react-leaflet",
      "leaflet",
    ],
  },
};

export default nextConfig;
