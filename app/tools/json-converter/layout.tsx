import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON Formatter & Converter - JSON, YAML, CSV",
  description:
    "Format, validate, and convert between JSON, YAML, and CSV. Beautify or minify JSON, find syntax errors, and transform data formats. Free online tool.",
  alternates: {
    canonical: "/tools/json-converter",
  },
  openGraph: {
    title: "JSON Formatter & Converter | Toolk1t",
    description:
      "Format, validate, and convert between JSON, YAML, and CSV. Free online tool with syntax highlighting.",
    url: "/tools/json-converter",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "JSON Formatter & Converter",
    description:
      "Format, validate, and convert between JSON, YAML, and CSV formats with syntax highlighting.",
    url: "https://toolk1t.com/tools/json-converter",
    applicationCategory: "DeveloperApplication",
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
      { "@type": "ListItem", position: 3, name: "JSON Converter" },
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
