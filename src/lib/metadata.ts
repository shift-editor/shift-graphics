import type { Metadata } from "next";

export const siteUrl = "https://shift.graphics";
export const siteName = "Shift";
export const siteDescription =
  "Design variable fonts on macOS, Windows, and Linux with Shift, a free and open-source font editor.";

export const twitter = { card: "summary_large_image", creator: "@kostyafarber_" } as const;
export const openGraph = { siteName, type: "website", locale: "en_US" } as const;

/**
 * A page's title, description, canonical URL, and share fields. Next merges
 * metadata shallowly, so a page that sets `openGraph` or `twitter` replaces the
 * layout's; building every page's from here keeps the shared fields.
 */
export function pageMetadata({
  title,
  description = siteDescription,
  path,
  article,
}: {
  title?: string;
  description?: string;
  path: string;
  /** Marks the page as an article published at this ISO date. */
  article?: { publishedTime?: string };
}): Metadata {
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: `${siteUrl}${path}` },
    openGraph: {
      ...openGraph,
      url: `${siteUrl}${path}`,
      ...(article ? { type: "article", publishedTime: article.publishedTime } : {}),
    },
    twitter,
  };
}
