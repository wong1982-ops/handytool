import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume Builder - AI-Powered Resume Creator",
  description:
    "Create professional resumes with AI assistance. Multiple themes, modular sections, live preview, and PDF export. Free online resume builder.",
  alternates: {
    canonical: "/tools/resume",
  },
  openGraph: {
    title: "Resume Builder | Toolk1t",
    description:
      "AI-powered resume builder with live preview, multiple themes, and PDF export. Free online tool.",
    url: "/tools/resume",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Resume Builder",
    description:
      "Create professional resumes with AI assistance. Multiple themes, modular sections, live preview, and PDF export.",
    url: "https://toolk1t.com/tools/resume",
    applicationCategory: "BusinessApplication",
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
      { "@type": "ListItem", position: 3, name: "Resume Builder" },
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
