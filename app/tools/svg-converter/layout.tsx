import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SVG Converter - Vectorize Images to SVG, EPS, PDF & PNG",
  description:
    "Convert raster images to vector graphics with batch processing. Export to SVG, EPS, PDF, and high-res PNG. Color and B&W modes, optimization stats. Free online tool.",
  alternates: {
    canonical: "/tools/svg-converter",
  },
  openGraph: {
    title: "SVG Converter - Vectorize to SVG, EPS, PDF, PNG | Toolk1t",
    description:
      "Batch convert images to vector graphics. Export SVG, EPS, PDF, PNG with color/B&W modes. Free online converter.",
    url: "/tools/svg-converter",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "SVG Converter",
    description:
      "Convert raster images (PNG, JPEG, WebP) to vector graphics. Batch processing, multi-format export (SVG, EPS, PDF, PNG), color and B&W modes.",
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
