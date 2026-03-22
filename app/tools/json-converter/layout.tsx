import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JSON/XML Formatter & Converter - JSON, YAML, CSV, XML",
  description:
    "Format, validate, and convert between JSON, YAML, CSV, and XML. Tree view, diff comparison, JSON Schema validation, JMESPath queries. Online tool.",
  alternates: {
    canonical: "/tools/json-converter",
  },
  openGraph: {
    title: "JSON/XML Formatter & Converter | Toolk1t",
    description:
      "Convert between JSON, YAML, CSV, and XML. Tree view, diff, schema validation, and JMESPath queries. Online tool.",
    url: "/tools/json-converter",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "JSON/XML Formatter & Converter",
    description:
      "Format, validate, and convert between JSON, YAML, CSV, and XML. Includes tree view, diff comparison, JSON Schema validation, and JMESPath queries.",
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
