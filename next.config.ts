import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "pdfjs-dist",
    "exceljs",
    "docx",
    "jspdf",
    "jszip",
    "@neplex/vectorizer",
  ],
  experimental: {
    optimizePackageImports: [
      "@wong1982-ops/toolk1t-ui",
      "react-leaflet",
      "leaflet",
    ],
  },
};

export default nextConfig;
