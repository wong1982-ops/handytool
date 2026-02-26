import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProfilePrompt } from "@/components/auth/profile-prompt";
import { PageTracker } from "@/lib/hooks/use-page-tracker";
import "./globals.scss";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://toolk1t.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Toolk1t - Free Online Tools",
    template: "%s | Toolk1t",
  },
  description:
    "Free online tools for developers and creators — IP lookup, JSON converter, image editor, PDF tools, speed test, and more.",
  openGraph: {
    type: "website",
    siteName: "Toolk1t",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Toolk1t",
  url: SITE_URL,
  description: "Free online tools for developers and creators",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className="antialiased min-h-screen flex flex-col"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Header brandName="Toolk1t" />
        {children}
        <Footer brandName="Toolk1t" />
        <ProfilePrompt />
        <PageTracker />
      </body>
    </html>
  );
}
