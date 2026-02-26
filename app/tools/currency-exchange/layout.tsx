import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Currency Exchange Rate Converter - Live Rates",
  description:
    "Convert currencies with live exchange rates. View historical rate charts, compare top currency pairs, and track daily changes. Free currency calculator.",
  alternates: {
    canonical: "/tools/currency-exchange",
  },
  openGraph: {
    title: "Currency Exchange Rate Converter | Toolk1t",
    description:
      "Convert currencies with live exchange rates and historical charts. Free online calculator.",
    url: "/tools/currency-exchange",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Currency Exchange Rate Converter",
    description:
      "Convert currencies with live exchange rates and historical charts.",
    url: "https://toolk1t.com/tools/currency-exchange",
    applicationCategory: "FinanceApplication",
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
      { "@type": "ListItem", position: 3, name: "Currency Exchange" },
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
