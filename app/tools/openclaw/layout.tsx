import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OpenClaw Chat - AI Agent Interface",
  description:
    "Chat with your self-hosted OpenClaw AI agent directly from the browser. Real-time WebSocket connection with streaming responses.",
  alternates: {
    canonical: "/tools/openclaw",
  },
  openGraph: {
    title: "OpenClaw Chat | Toolk1t",
    description:
      "Chat with your OpenClaw AI agent. Real-time WebSocket connection with streaming responses.",
    url: "/tools/openclaw",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "OpenClaw Chat",
    description:
      "Chat with your self-hosted OpenClaw AI agent directly from the browser.",
    url: "https://toolk1t.com/tools/openclaw",
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
      { "@type": "ListItem", position: 3, name: "OpenClaw Chat" },
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
