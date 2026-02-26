import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Currency & Crypto Exchange Rate Converter - Live Rates",
  description:
    "Convert fiat currencies and cryptocurrencies with live rates. Multi-currency comparison, rate alerts, favorites, offline mode, and historical charts. Free calculator.",
  alternates: {
    canonical: "/tools/currency-exchange",
  },
  openGraph: {
    title: "Currency & Crypto Exchange Converter | Toolk1t",
    description:
      "Convert fiat and crypto with live rates. Multi-currency view, rate alerts, favorites, and offline support. Free calculator.",
    url: "/tools/currency-exchange",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Currency & Crypto Exchange Rate Converter",
    description:
      "Convert fiat currencies and cryptocurrencies with live rates. Includes multi-currency comparison, rate alerts, favorites, and offline support.",
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
