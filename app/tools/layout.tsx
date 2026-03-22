import type { Metadata } from "next";
import { ToolsLayoutClient } from "./tools-layout-client";

export const metadata: Metadata = {
  title: "Online Tools",
  description:
    "Browse all online tools: IP lookup, speed test, PDF converter, image editor, JSON formatter, currency exchange, SVG converter, Swagger editor, and ID photo maker.",
  alternates: {
    canonical: "/tools",
  },
  openGraph: {
    title: "Online Tools | Toolk1t",
    description:
      "Browse all online tools: IP lookup, speed test, PDF converter, image editor, JSON formatter, currency exchange, and more.",
    url: "/tools",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Online Tools",
  description:
    "A collection of online tools for developers and everyday use.",
  url: "https://toolk1t.com/tools",
  isPartOf: {
    "@type": "WebSite",
    name: "Toolk1t",
    url: "https://toolk1t.com",
  },
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToolsLayoutClient>{children}</ToolsLayoutClient>
    </>
  );
}
