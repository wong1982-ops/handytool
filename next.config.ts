import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'platform-lookaside.fbsbx.com' },
      { protocol: 'https', hostname: 'graph.facebook.com' },
    ],
  },
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

export default nextConfig;
