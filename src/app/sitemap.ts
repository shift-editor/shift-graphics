import type { MetadataRoute } from "next";
import { docsSource } from "../lib/docs-source";
import { siteUrl } from "../lib/metadata";
import { getReleases } from "../lib/releases";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const releases = await getReleases();
  const latest = releases[0]?.date ?? undefined;

  return [
    { url: siteUrl, lastModified: latest },
    { url: `${siteUrl}/downloads`, lastModified: latest },
    { url: `${siteUrl}/downloads/nightly` },
    { url: `${siteUrl}/releases`, lastModified: latest },
    ...releases.map((release) => ({
      url: `${siteUrl}/releases/${encodeURIComponent(release.version)}`,
      lastModified: release.date ?? undefined,
    })),
    ...docsSource.getPages().map((page) => ({ url: `${siteUrl}${page.url}` })),
  ];
}
