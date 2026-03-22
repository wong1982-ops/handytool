import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JWT Decoder, Verifier & Generator — Online Tool",
  description:
    "Decode, verify, and generate JSON Web Tokens (JWT) online. Supports all algorithms: HS256, HS384, HS512, RS256, RS384, RS512, ES256, ES384, ES512, EdDSA. 100% client-side — your tokens never leave your browser.",
  alternates: {
    canonical: "/tools/jwt-decoder",
  },
  openGraph: {
    title: "JWT Decoder, Verifier & Generator | Toolk1t",
    description:
      "Decode, verify, and generate JWTs in your browser. Supports all HMAC, RSA, ECDSA, and EdDSA algorithms. Free, fast, and private.",
    url: "/tools/jwt-decoder",
  },
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "JWT Decoder, Verifier & Generator",
    description:
      "Decode, verify, and generate JSON Web Tokens (JWT) with support for all signing algorithms including HMAC, RSA, ECDSA, and EdDSA. 100% client-side processing — tokens never leave your browser.",
    url: "https://toolk1t.com/tools/jwt-decoder",
    applicationCategory: "DeveloperApplication",
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
      { "@type": "ListItem", position: 3, name: "JWT Decoder" },
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
