import type { NextConfig } from "next";

const apiUrl = process.env.API_URL || "http://localhost:3001";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "@wong1982-ops/handytool-ui",
      "react-leaflet",
      "leaflet",
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
