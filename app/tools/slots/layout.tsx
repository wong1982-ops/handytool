import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Toolk1t Casino - Free Slot Machines",
  description: "Free-to-play slot machines with authentic casino experience. 10 themed games, bonus rounds, leaderboards, and more.",
  alternates: { canonical: "/tools/slots" },
  openGraph: {
    title: "Toolk1t Casino | Free Slots",
    description: "Play 10 themed slot machines for free. Daily bonuses, bonus rounds, and social features.",
    url: "/tools/slots",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Toolk1t Casino",
    description: "Free-to-play slot machines with authentic casino experience.",
    url: "https://toolk1t.com/tools/slots",
    applicationCategory: "GameApplication",
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
      { "@type": "ListItem", position: 3, name: "Casino" },
    ],
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {children}
    </>
  );
}
