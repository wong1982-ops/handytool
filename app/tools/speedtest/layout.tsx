import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Internet Speed Test - Check Download & Upload Speed",
  description:
    "Test your internet connection speed with accurate download, upload, and latency measurements. View stability graphs and ISP details. Free, instant results.",
  alternates: {
    canonical: "/tools/speedtest",
  },
  openGraph: {
    title: "Internet Speed Test | Toolk1t",
    description:
      "Test your internet speed: download, upload, ping, and jitter. Instant results with stability graph.",
    url: "/tools/speedtest",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Internet Speed Test",
    description:
      "Test your internet connection speed with download, upload, latency, and jitter measurements.",
    url: "https://toolk1t.app/tools/speedtest",
    applicationCategory: "UtilitiesApplication",
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
      { "@type": "ListItem", position: 3, name: "Speed Test" },
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
