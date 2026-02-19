import type { Metadata } from "next";
import { ToolsLayoutClient } from "./tools-layout-client";

export const metadata: Metadata = {
  title: "Free Online Tools",
  description:
    "Browse all free online tools: IP lookup, speed test, PDF converter, image editor, JSON formatter, currency exchange, SVG converter, Swagger editor, and ID photo maker.",
  alternates: {
    canonical: "/tools",
  },
  openGraph: {
    title: "Free Online Tools | HandyTool",
    description:
      "Browse all free online tools: IP lookup, speed test, PDF converter, image editor, JSON formatter, currency exchange, and more.",
    url: "/tools",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Free Online Tools",
  description:
    "A collection of free online tools for developers and everyday use.",
  url: "https://handytool.app/tools",
  isPartOf: {
    "@type": "WebSite",
    name: "HandyTool",
    url: "https://handytool.app",
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
