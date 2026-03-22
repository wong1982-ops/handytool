import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Toolk1t - Online Tools",
    short_name: "Toolk1t",
    description:
      "Online tools for developers and creators — IP lookup, JSON converter, image editor, PDF tools, speed test, and more.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
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
