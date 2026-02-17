import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Converter - Merge, Split, Compress & Convert PDFs",
  description:
    "All-in-one PDF tool: convert PDF to images, merge multiple PDFs, split by pages, compress file size, and convert between PDF, Word, and Excel. Free online.",
  alternates: {
    canonical: "/tools/pdf-converter",
  },
  openGraph: {
    title: "PDF Converter - Merge, Split, Compress | HandyTool",
    description:
      "All-in-one free PDF tool: convert, merge, split, compress, and transform PDFs online.",
    url: "/tools/pdf-converter",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PDF Converter",
    description:
      "Convert, merge, split, and compress PDF files. Supports PDF to images, Word, and Excel conversions.",
    url: "https://handytool.app/tools/pdf-converter",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    isPartOf: { "@type": "WebSite", name: "HandyTool", url: "https://handytool.app" },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://handytool.app" },
      { "@type": "ListItem", position: 2, name: "Tools", item: "https://handytool.app/tools" },
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
