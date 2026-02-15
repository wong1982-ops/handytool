import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HandyTool - Free Online Tools",
    short_name: "HandyTool",
    description:
      "Free online tools for developers and everyday use: IP lookup, speed test, PDF converter, image editor, JSON formatter, and more.",
    start_url: "/tools",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#3D6AF2",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
