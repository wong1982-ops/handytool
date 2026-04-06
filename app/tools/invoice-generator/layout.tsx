import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Invoice Generator - Create Professional Invoices",
  description:
    "Create and download professional invoices for free. Multi-currency support, customizable templates, PDF export. Save templates when signed in.",
  alternates: {
    canonical: "/tools/invoice-generator",
  },
  openGraph: {
    title: "Invoice Generator | Toolk1t",
    description:
      "Free invoice generator with multi-currency, customizable templates, and PDF export.",
    url: "/tools/invoice-generator",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Invoice Generator",
    description:
      "Create professional invoices with multi-currency support, customizable templates, and PDF export. Free online tool.",
    url: "https://toolk1t.com/tools/invoice-generator",
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
      { "@type": "ListItem", position: 3, name: "Invoice Generator" },
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
