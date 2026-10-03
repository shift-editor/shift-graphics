import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Separator } from "../../components/ui/Separator";
import { downloadLinks } from "../../../lib/downloads";
import { getDisplayDate, getReleases } from "../../../lib/releases";
import DownloadPanel from "./DownloadPanel";

export const metadata: Metadata = {
  title: "Download Shift",
  description:
    "Download Shift, the free and open-source font editor, for macOS, Windows, and Linux.",
};

export default async function DownloadsPage() {
  const [release] = await getReleases();
  const links = release ? downloadLinks(release.assets) : [];

  return (
    <div className="release-page flex flex-1 flex-col font-normal">
      <main className="mx-auto mt-16 w-full max-w-[1040px] flex-1 pb-20 sm:mt-24 min-[900px]:px-10">
        <header>
          <h1 className="text-display tracking-tight [font-size:2.625rem]">Download Shift</h1>
          <p className="mt-4 max-w-xl text-copy text-secondary">
            Free and open-source for macOS, Windows, and Linux.
          </p>
        </header>

        <Separator className="my-12 bg-line min-[900px]:mb-16" />

        <div className="max-w-[720px]">
          {release && links.length > 0 ? (
            <section aria-labelledby="latest-release">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <h2 id="latest-release" className="text-sm font-medium">
                  v{release.version}
                  <span className="text-muted">
                    {" · "}
                    <time dateTime={getDisplayDate(release).dateTime}>
                      {getDisplayDate(release).label}
                    </time>
                  </span>
                </h2>
                <Link
                  href={`/releases/${release.version}`}
                  className="inline-flex items-center gap-1.5 text-sm text-secondary hover:text-accent"
                >
                  Release notes
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
              <div className="mt-4">
                <DownloadPanel links={links} name={`Shift ${release.version}`} />
              </div>
            </section>
          ) : (
            <p className="text-copy text-secondary">The first release is on its way.</p>
          )}

          <p className="mt-8 flex items-center gap-2.5 text-sm text-secondary">
            <Image
              src="/nightly-ghost.svg"
              alt=""
              width={406}
              height={312}
              unoptimized
              className="h-4 w-auto"
            />
            Want the newest changes early?
            <Link
              href="/downloads/nightly"
              className="inline-flex items-center gap-1 text-accent hover:opacity-70"
            >
              Try Nightly
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
