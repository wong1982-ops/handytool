import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProfilePrompt } from "@/components/auth/profile-prompt";
import { InstallPrompt } from "@/components/layout/install-prompt";
import { PageTracker } from "@/lib/hooks/use-page-tracker";
import { MobileShell } from "@/components/mobile/mobile-shell";
import { TrackingPixels } from "@/components/analytics/tracking-pixels";
import "./globals.scss";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://toolk1t.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Toolk1t - Online Tools",
    template: "%s | Toolk1t",
  },
  description:
    "Online tools for developers and creators — IP lookup, JSON converter, image editor, PDF tools, speed test, and more.",
  openGraph: {
    type: "website",
    siteName: "Toolk1t",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Toolk1t - Online Tools",
    description:
      "Online tools for developers and creators — IP lookup, JSON converter, image editor, PDF tools, speed test, and more.",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Toolk1t",
  url: SITE_URL,
  description: "Online tools for developers and creators",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Toolk1t",
  url: SITE_URL,
  description: "Online tools for developers and creators — IP lookup, JSON converter, image editor, PDF tools, speed test, and more.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/tools?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const toolsJsonLd = [
  { name: "IP Check", href: "/tools/ipcheck", description: "Look up any IP address or domain — location, ISP, timezone, and more" },
  { name: "My IP", href: "/tools/myip", description: "Find your public IP address, location, and network details instantly" },
  { name: "Speed Test", href: "/tools/speedtest", description: "Test your internet download and upload speed with latency metrics" },
  { name: "JSON Converter", href: "/tools/json-converter", description: "Format, convert and validate JSON, YAML, and CSV data" },
  { name: "Swagger Editor", href: "/tools/swagger-editor", description: "Edit and preview OpenAPI specifications with live validation" },
  { name: "JWT Decoder", href: "/tools/jwt-decoder", description: "Decode, verify, and generate JSON Web Tokens client-side" },
  { name: "Regex Tester", href: "/tools/regex-tester", description: "Test regular expressions with 30+ preset patterns, match highlighting, and replace mode" },
  { name: "Favicon Generator", href: "/tools/favicon-generator", description: "Create favicons from text, icons, images, or AI — download a complete package" },
  { name: "Color Palette Generator", href: "/tools/color-palette", description: "Generate color palettes with harmony rules, image extraction, and accessibility checking" },
  { name: "ID Photo Editor", href: "/tools/id-photo", description: "Create passport and visa photos with correct dimensions and background" },
  { name: "PDF Converter", href: "/tools/pdf-converter", description: "Convert PDF to images, merge, split, and compress PDF files" },
  { name: "Image Editor", href: "/tools/image-editor", description: "Edit images with filters, adjustments, crop, and layers" },
  { name: "SVG Converter", href: "/tools/svg-converter", description: "Convert raster images to vector SVG format" },
  { name: "Currency Exchange", href: "/tools/currency-exchange", description: "Convert currencies with live exchange rates and historical charts" },
  { name: "ECard Studio", href: "/tools/ecard-studio", description: "Design professional e-cards for business occasions" },
  { name: "Human Benchmark", href: "/tools/human-benchmark", description: "Brain games and cognitive tests to measure reaction time, memory, and more" },
  { name: "Story Studio", href: "/tools/story-studio", description: "Create AI-illustrated picture books from your story ideas" },
  { name: "Job Radar", href: "/tools/job-radar", description: "AU and NZ tech and French language jobs updated daily" },
  { name: "AI Radar", href: "/tools/ai-radar", description: "Latest AI model releases and major updates updated daily" },
].map((tool) => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: `${tool.name} — Toolk1t`,
  url: `${SITE_URL}${tool.href}`,
  description: tool.description,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
}));

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3D6AF2" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className="antialiased min-h-screen flex flex-col"
        style={{ overscrollBehaviorX: 'none' }}
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(toolsJsonLd) }}
        />
        <Header brandName="Toolk1t" />
        {children}
        <Footer brandName="Toolk1t" />
        <MobileShell>{children}</MobileShell>
        <ProfilePrompt />
        <InstallPrompt />
        <PageTracker />
        {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
        <TrackingPixels />
      </body>
    </html>
  );
}
