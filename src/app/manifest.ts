import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "OwnHero — Training, with intention",
    short_name: "OwnHero",
    description: "Plan training, log performance, and follow your progress over time.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#101012",
    theme_color: "#7653d6",
    categories: ["health", "lifestyle"],
    icons: [
      { src: "/icons/ownhero-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/ownhero-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/ownhero-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
    ]
  };
}
