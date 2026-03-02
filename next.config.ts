import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "pdfjs-dist",
    "exceljs",
    "docx",
    "jspdf",
    "jszip",
    "@neplex/vectorizer",
    "nodemailer",
  ],
  experimental: {
    optimizePackageImports: [
      "@wong1982-ops/toolk1t-ui",
      "react-leaflet",
      "leaflet",
    ],
  },
};

export default withSerwist(nextConfig);
