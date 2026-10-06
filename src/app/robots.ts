import type { MetadataRoute } from "next";
import { siteUrl } from "../lib/metadata";

export default function robots(): MetadataRoute.Robots {
  // Preview deployments carry drafts; keep them out of search entirely.
  if (process.env.VERCEL_ENV === "preview") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/", disallow: "/preview/" },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
