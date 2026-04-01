import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Local Services - Find Nearby Businesses",
  description: "Find nearby plumbers, electricians, hairdressers, doctors, and more. Contact info, opening hours, and reviews. Free local services directory.",
  alternates: { canonical: "/tools/local-services" },
  openGraph: {
    title: "Local Services | Toolk1t",
    description: "Find nearby services — plumber, hairdresser, doctor, and more.",
    url: "/tools/local-services",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Local Services",
    description: "Find nearby plumbers, electricians, hairdressers, doctors, and more.",
    url: "https://toolk1t.com/tools/local-services",
    applicationCategory: "UtilitiesApplication",
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
      { "@type": "ListItem", position: 3, name: "Local Services" },
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
