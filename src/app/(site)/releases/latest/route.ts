import { getReleases } from "../../../../lib/releases";

// Rebuilt on every deploy, which is when a new release can appear.
export const dynamic = "force-static";

/** Redirects to the newest published release, or the index before there is one. */
export async function GET() {
  const [latest] = await getReleases();
  const location = latest ? `/releases/${encodeURIComponent(latest.version)}` : "/releases";

  return new Response(null, { status: 307, headers: { Location: location } });
}
