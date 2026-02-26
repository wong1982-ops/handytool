import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IP Address & Domain Lookup - Check Any IP",
  description:
    "Look up any IP address or domain name. Get geolocation, ISP, proxy detection, ASN, and detailed network information. Free online tool.",
  alternates: {
    canonical: "/tools/ipcheck",
  },
  openGraph: {
    title: "IP Address & Domain Lookup | Toolk1t",
    description:
      "Look up any IP address or domain. Get geolocation, ISP, proxy detection, and network details.",
    url: "/tools/ipcheck",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "IP Address & Domain Lookup",
    description:
      "Look up any IP address or domain for geolocation, ISP, proxy detection, and network information.",
    url: "https://toolk1t.com/tools/ipcheck",
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
      { "@type": "ListItem", position: 3, name: "IP Check" },
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
