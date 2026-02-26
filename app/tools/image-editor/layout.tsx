import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Online Image Editor - Edit, Adjust & Apply Filters",
  description:
    "Edit images online with brightness, contrast, saturation adjustments, creative filters, and zoom controls. Supports PNG, JPEG, WebP. Free, no upload needed.",
  alternates: {
    canonical: "/tools/image-editor",
  },
  openGraph: {
    title: "Online Image Editor | Toolk1t",
    description:
      "Edit images with adjustments, filters, and zoom. Free online tool, no upload to server.",
    url: "/tools/image-editor",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Online Image Editor",
    description:
      "Edit images with brightness, contrast, saturation adjustments, creative filters, and zoom controls.",
    url: "https://toolk1t.com/tools/image-editor",
    applicationCategory: "MultimediaApplication",
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
      { "@type": "ListItem", position: 3, name: "Image Editor" },
    ],
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Lock body to viewport height for editor-style tool */}
      <style dangerouslySetInnerHTML={{ __html: 'body{height:100dvh;overflow:hidden}' }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
