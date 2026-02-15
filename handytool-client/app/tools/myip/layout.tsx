import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My IP Address Lookup - Find Your Public IP",
  description:
    "Instantly find your public IP address with geolocation, ISP details, timezone, and an interactive map. Free, no sign-up required.",
  alternates: {
    canonical: "/tools/myip",
  },
  openGraph: {
    title: "My IP Address Lookup | HandyTool",
    description:
      "Find your public IP address with location, ISP, and security details.",
    url: "/tools/myip",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "My IP Address Lookup",
    description:
      "Find your public IP address with geolocation, ISP details, and an interactive map.",
    url: "https://handytool.app/tools/myip",
    applicationCategory: "UtilitiesApplication",
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
      { "@type": "ListItem", position: 3, name: "My IP" },
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
