import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Converter - Merge, Split, Compress, Watermark & Manage Pages",
  description:
    "All-in-one PDF tool: convert, merge, split, compress, watermark, and manage pages. Batch processing with ZIP download. Supports PDF, Word, Excel, and images. Free.",
  alternates: {
    canonical: "/tools/pdf-converter",
  },
  openGraph: {
    title: "PDF Converter - Merge, Split, Watermark, Manage Pages | Toolk1t",
    description:
      "All-in-one free PDF tool: convert, merge, split, compress, watermark, and manage pages with batch processing.",
    url: "/tools/pdf-converter",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PDF Converter",
    description:
      "Convert, merge, split, compress, watermark, and manage PDF pages. Batch processing with ZIP download. Supports PDF, Word, Excel, and image conversions.",
    url: "https://toolk1t.com/tools/pdf-converter",
    applicationCategory: "BusinessApplication",
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
      { "@type": "ListItem", position: 3, name: "PDF Converter" },
    ],
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
