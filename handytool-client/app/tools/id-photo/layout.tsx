import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ID Photo Editor - Create Passport & Visa Photos",
  description:
    "Create compliant passport and visa photos online. Auto face detection, background color picker, compliance checking for US passport, visa, and more. Free tool.",
  alternates: {
    canonical: "/tools/id-photo",
  },
  openGraph: {
    title: "ID Photo Editor - Passport & Visa Photos | HandyTool",
    description:
      "Create compliant passport and visa photos with face detection and compliance checking. Free online.",
    url: "/tools/id-photo",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ID Photo Editor",
    description:
      "Create compliant passport and visa photos with face detection, background adjustment, and compliance checking.",
    url: "https://handytool.app/tools/id-photo",
    applicationCategory: "MultimediaApplication",
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
      { "@type": "ListItem", position: 3, name: "ID Photo Editor" },
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
