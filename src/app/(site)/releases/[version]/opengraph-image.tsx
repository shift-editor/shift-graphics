import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getVisibleReleases } from "../../../../lib/releases";
import { releasesImage } from "../../../og";

export const alt = "Shift release notes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// One image per release page, prerendered like the pages themselves.
export const dynamicParams = false;

export async function generateStaticParams() {
  const versions = new Set((await getVisibleReleases()).map(({ version }) => version));
  return [...versions].map((version) => ({ version }));
}

export default async function Image({ params }: { params: Promise<{ version: string }> }) {
  const { version } = await params;
  // A hand-made card published with the release's images wins over the generated one.
  const custom = await readFile(join(process.cwd(), "public/releases", version, "og.png")).catch(
    () => null,
  );
  if (custom) return new Response(new Uint8Array(custom), { headers: { "Content-Type": "image/png" } });

  return releasesImage();
}
