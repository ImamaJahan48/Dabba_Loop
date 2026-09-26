import type { MetadataRoute } from "next";
import { brand } from "@/config/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: brand.name,
    short_name: brand.name,
    description: "Flexible home-style meal credits and hub delivery.",
    start_url: "/app",
    display: "standalone",
    background_color: "#F8FCF7",
    theme_color: "#0F6B3F",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }]
  };
}
