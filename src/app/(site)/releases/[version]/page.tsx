import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMetadata } from "../../../../lib/metadata";
import { releaseSummary } from "../../../../lib/release-notes";
import { getVisibleReleases } from "../../../../lib/releases";
import ReleaseEntry from "../ReleaseEntry";

// Only versions present in approved snapshots or local drafts exist.
export const dynamicParams = false;

export async function generateStaticParams() {
  const releases = await getVisibleReleases();
  const versions = new Set(releases.map(({ version }) => version));

  return [...versions].map((version) => ({ version }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ version: string }>;
}): Promise<Metadata> {
  const { version } = await params;
  const release = (await getVisibleReleases()).find((entry) => entry.version === version);
  const path = `/releases/${encodeURIComponent(version)}`;

  return {
    ...pageMetadata({
      title: `${version} release notes`,
      description:
        (release && releaseSummary(release.body)) ??
        `New features, improvements, and fixes in Shift ${version}.`,
      path,
      article: { publishedTime: release?.date ?? undefined },
    }),
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
  const releases = await getVisibleReleases();
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
