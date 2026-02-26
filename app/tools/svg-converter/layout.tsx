import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SVG Converter - Convert Images to Vector Graphics",
  description:
    "Convert PNG, JPEG, and WebP images to scalable SVG vector graphics. Adjust vectorization settings, compare side-by-side, and download optimized SVGs. Free tool.",
  alternates: {
    canonical: "/tools/svg-converter",
  },
  openGraph: {
    title: "SVG Converter - Raster to Vector | Toolk1t",
    description:
      "Convert raster images to scalable SVG vector graphics with adjustable settings. Free online converter.",
    url: "/tools/svg-converter",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "SVG Converter",
    description:
      "Convert raster images (PNG, JPEG, WebP) to scalable SVG vector graphics with adjustable vectorization settings.",
    url: "https://toolk1t.com/tools/svg-converter",
    applicationCategory: "DesignApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    isPartOf: { "@type": "WebSite", name: "Toolk1t", url: "https://toolk1t.com" },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://toolk1t.com" },
      { "@type": "ListItem", position: 2, name: "Tools", item: "https://toolk1t.com/tools" },
      { "@type": "ListItem", position: 3, name: "SVG Converter" },
    ],
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Lock body to viewport height for editor-style tool */}
      <style dangerouslySetInnerHTML={{ __html: 'body{height:100dvh;overflow:hidden}' }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
