import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Swagger Editor - Edit & Preview OpenAPI Specs",
  description:
    "Edit OpenAPI/Swagger YAML specifications with live preview, real-time validation, and Swagger UI rendering. Free online API documentation editor.",
  alternates: {
    canonical: "/tools/swagger-editor",
  },
  openGraph: {
    title: "Swagger Editor - OpenAPI Spec Editor | Toolk1t",
    description:
      "Edit OpenAPI/Swagger YAML with live Swagger UI preview and real-time validation. Free online.",
    url: "/tools/swagger-editor",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Swagger Editor",
    description:
      "Edit OpenAPI/Swagger YAML specifications with live preview, validation, and Swagger UI rendering.",
    url: "https://toolk1t.app/tools/swagger-editor",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    isPartOf: { "@type": "WebSite", name: "Toolk1t", url: "https://toolk1t.app" },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://toolk1t.app" },
      { "@type": "ListItem", position: 2, name: "Tools", item: "https://toolk1t.app/tools" },
      { "@type": "ListItem", position: 3, name: "Swagger Editor" },
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
