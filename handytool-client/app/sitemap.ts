import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://handytool.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const tools = [
    { slug: "ipcheck", priority: 0.8 },
    { slug: "myip", priority: 0.8 },
    { slug: "speedtest", priority: 0.8 },
    { slug: "json-converter", priority: 0.8 },
    { slug: "swagger-editor", priority: 0.7 },
    { slug: "id-photo", priority: 0.8 },
    { slug: "pdf-converter", priority: 0.9 },
    { slug: "image-editor", priority: 0.8 },
    { slug: "currency-exchange", priority: 0.8 },
    { slug: "svg-converter", priority: 0.7 },
  ];

  const now = new Date();

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/tools`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...tools.map((tool) => ({
      url: `${SITE_URL}/tools/${tool.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: tool.priority,
    })),
  ];
}
