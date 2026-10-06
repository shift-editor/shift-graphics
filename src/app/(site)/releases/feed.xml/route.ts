import { siteUrl } from "../../../../lib/metadata";
import { releaseSummary } from "../../../../lib/release-notes";
import { getReleases } from "../../../../lib/releases";

export const dynamic = "force-static";

const xmlEntities: Record<string, string> = {
  "<": "&lt;",
  ">": "&gt;",
  "&": "&amp;",
  "'": "&apos;",
  '"': "&quot;",
};
const escapeXml = (text: string) => text.replace(/[<>&'"]/g, (char) => xmlEntities[char]);

/** An RSS 2.0 feed of published releases, newest first. */
export async function GET() {
  const releases = await getReleases();
  const items = releases.map((release) => {
    const url = `${siteUrl}/releases/${encodeURIComponent(release.version)}`;
    const summary = releaseSummary(release.body);

    return [
      "<item>",
      `<title>${escapeXml(`Shift ${release.version}: ${release.title}`)}</title>`,
      `<link>${url}</link>`,
      `<guid isPermaLink="true">${url}</guid>`,
      release.date ? `<pubDate>${new Date(release.date).toUTCString()}</pubDate>` : "",
      summary ? `<description>${escapeXml(summary)}</description>` : "",
      "</item>",
    ].join("");
  });
  const latest = releases[0]?.date;

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>Shift release notes</title>
<link>${siteUrl}/releases</link>
<description>New features, improvements, and fixes in Shift, the free and open-source font editor.</description>
<language>en</language>
<atom:link href="${siteUrl}/releases/feed.xml" rel="self" type="application/rss+xml"/>
${latest ? `<lastBuildDate>${new Date(latest).toUTCString()}</lastBuildDate>\n` : ""}${items.join("\n")}
</channel>
</rss>
`;

  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
