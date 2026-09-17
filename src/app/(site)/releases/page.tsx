import type { Metadata } from "next";
import Image from "next/image";
import { Separator } from "../../components/ui/Separator";
import { getReleases } from "../../../lib/releases";
import ReleaseEntry from "./ReleaseEntry";

export const metadata: Metadata = {
  title: "Release notes · Shift",
  description:
    "New features, improvements, and fixes in Shift, the free and open-source font editor.",
};

export default async function ReleasesPage() {
  const draftsVisible =
    process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview";
  const [published, drafts] = await Promise.all([
    getReleases(),
    draftsVisible ? getReleases({ draft: true }) : [],
  ]);
  const draftVersions = new Set(drafts.map(({ version }) => version));
  const releases = [
    ...drafts,
    ...published.filter(({ version }) => !draftVersions.has(version)),
  ];

  return (
    <div className="release-page flex flex-1 flex-col font-normal">
      <a
        href="#release-notes"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-surface-raised focus:p-3"
      >
        Skip to release notes
      </a>
      <main
        id="release-notes"
        className="mx-auto mt-16 w-full max-w-[1040px] flex-1 pb-20 sm:mt-24 min-[900px]:px-10"
      >
        <header className="">
          <h1 className="text-display">
            Release notes
          </h1>
          <p className="mt-4 max-w-xl text-copy text-secondary">
            The latest features, improvements, and fixes in Shift.
          </p>
        </header>

        <Separator className="my-12 bg-line min-[900px]:mb-16" />

        {releases.length === 0 ? (
          <section className="mx-auto max-w-2xl text-center">
            <Image
              src="/hero.png"
              alt="Shift font editor — website artwork"
              width={1200}
              height={800}
              unoptimized
              className="h-auto w-full"
            />
            <h2 className="mt-6 text-xl font-medium tracking-tight">
              The first release notes are on their way.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-secondary">
              In the meantime, you can explore the experimental{" "}
              <a
                href="https://github.com/shift-editor/shift/releases/tag/nightly"
                className="text-accent hover:opacity-70"
              >
                Nightly builds
              </a>
              .
            </p>
          </section>
        ) : (
          <div className="space-y-14 min-[900px]:space-y-20">
            {releases.map((release, index) => {
              const previousYear = releases[index - 1]?.date?.slice(0, 4);
              const year = release.date?.slice(0, 4);
              const showYear = releases.length > 8 && year && year !== previousYear;

              return (
                <section
                  key={release.version}
                  className="border-t border-line pt-12 first:border-t-0 first:pt-0 min-[900px]:pt-16"
                >
                  {showYear && (
                    <h2 className="mx-auto mb-6 max-w-[720px] text-sm font-medium text-muted min-[900px]:max-w-none">
                      {year}
                    </h2>
                  )}
                  <ReleaseEntry release={release} view="feed" titleLevel={2} />
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
