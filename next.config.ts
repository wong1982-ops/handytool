import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'platform-lookaside.fbsbx.com' },
      { protocol: 'https', hostname: 'graph.facebook.com' },
      { protocol: 'https', hostname: 'pub-8feef024ac6a4d26b109ddfe22f033c1.r2.dev' },
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
