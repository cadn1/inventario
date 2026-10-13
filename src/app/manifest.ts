import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Despensa",
    short_name: "Despensa",
    start_url: "/",
    display: "standalone",
    background_color: "#f1f4ee",
    theme_color: "#2b5d86",
  };
}
