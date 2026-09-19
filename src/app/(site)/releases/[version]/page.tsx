import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getReleases } from "../../../../lib/releases";
import ReleaseEntry from "../ReleaseEntry";

async function allReleases() {
  const draftsVisible =
    process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview";
  const [published, drafts] = await Promise.all([
    getReleases(),
    draftsVisible ? getReleases({ draft: true }) : [],
  ]);

  return [...drafts, ...published];
}

// Only versions present in approved snapshots or local drafts exist.
export const dynamicParams = false;

export async function generateStaticParams() {
  const releases = await allReleases();
  const versions = new Set(releases.map(({ version }) => version));

  return [...versions].map((version) => ({ version }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ version: string }>;
}): Promise<Metadata> {
  const { version } = await params;

  return {
    title: `Shift ${version} · Release notes`,
    description: `Features, improvements, downloads, and the full changelog for Shift ${version}.`,
    alternates: {
      canonical: `https://shift.graphics/releases/${encodeURIComponent(version)}`,
    },
    ...(process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview"
      ? { robots: { index: false, follow: false } }
      : {}),
  };
}

export default async function ReleasePage({
  params,
}: {
  params: Promise<{ version: string }>;
}) {
  const { version } = await params;
  const releases = await allReleases();
  const release = releases.find((entry) => entry.version === version);

  if (!release) notFound();

  return (
    <div className="release-page flex-1 font-normal">
      <a
        href="#release-notes"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-surface-raised focus:p-3"
      >
        Skip to release notes
      </a>
      <main
        id="release-notes"
        className="mx-auto mt-16 w-full max-w-[1040px] pb-20 sm:mt-24 min-[900px]:px-10"
      >
        <ReleaseEntry release={release} view="page" titleLevel={1} />
      </main>
    </div>
  );
}
