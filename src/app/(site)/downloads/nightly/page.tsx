import Image from "next/image";
import { Separator } from "../../../components/ui/Separator";
import { nightlyDownloadLinks } from "../../../../lib/downloads";
import { pageMetadata } from "../../../../lib/metadata";
import DownloadPanel from "../DownloadPanel";

export const metadata = pageMetadata({
  title: "Nightly",
  description:
    "Experimental builds of Shift from the latest development code, for macOS, Windows, and Linux.",
  path: "/downloads/nightly",
});

export default function NightlyPage() {
  return (
    <div className="release-page flex flex-1 flex-col font-normal">
      <main className="mx-auto mt-16 w-full max-w-[1040px] flex-1 pb-20 sm:mt-24 min-[900px]:px-10">
        <header>
          <h1 className="flex items-center gap-4 text-display tracking-tight [font-size:2.625rem]">
            <Image
              src="/nightly-ghost.svg"
              alt=""
              width={406}
              height={312}
              unoptimized
              className="h-9 w-auto"
            />
            Shift Nightly
          </h1>
          <p className="mt-4 max-w-xl text-copy text-secondary">
            Try the newest changes before they reach a release. Built from the latest development
            code — expect bugs.
          </p>
        </header>

        <Separator className="my-12 bg-line min-[900px]:mb-16" />

        <section aria-label="Nightly downloads" className="max-w-[720px]">
          <DownloadPanel links={nightlyDownloadLinks()} name="Shift Nightly" variant="nightly" />
          <p className="mt-4 text-sm text-muted">
            Found a bug?{" "}
            <a
              href="https://github.com/shift-editor/shift/issues"
              className="text-accent hover:opacity-70"
            >
              Report it on GitHub
            </a>
            .
          </p>
        </section>
      </main>
    </div>
  );
}
