import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getDisplayDate, type Release } from "../../../lib/releases";
import { Heading, nextHeadingLevel, type HeadingLevel } from "../../components/Heading";
import { MarkdownContent } from "../../components/MarkdownContent";
import { Separator } from "../../components/ui/Separator";
import { ReleaseGhost } from "./ReleaseGhost";


export default function ReleaseEntry({
  release,
  view,
  titleLevel,
}: {
  release: Release;
  view: "feed" | "page";
  titleLevel: HeadingLevel;
}) {
  const { label: date, dateTime } = getDisplayDate(release);

  const contentHeadingLevel = nextHeadingLevel(titleLevel);

  return (
    <article
      id={release.version}
      aria-labelledby={`${release.version}-title`}
      className="mx-auto grid max-w-[720px] scroll-mt-8 items-start gap-7 min-[900px]:max-w-none min-[900px]:grid-cols-[200px_minmax(0,1fr)] min-[900px]:gap-10"
    >
      <aside
        aria-label={`Shift ${release.version} release information`}
        className="relative min-w-0 min-[900px]:h-full min-[900px]:self-stretch min-[900px]:overflow-clip"
      >
        <div className="min-[900px]:sticky min-[900px]:top-8 min-[900px]:self-start">
          {view === "page" && (
            <Link
              href="/releases"
              className="mb-6 inline-flex items-center gap-2 text-sm text-secondary transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              All releases
            </Link>
          )}
          <Link
            href={`/releases/${release.version}`}
            className="block break-words font-release-heading text-sm font-medium tracking-tight hover:text-accent"
          >
            {release.version}
          </Link>
          {date && (
            <div className="relative mt-3 grid grid-cols-[24px_1fr] items-center gap-x-3">
              <ReleaseGhost />
              {dateTime ? (
                <time dateTime={dateTime} className="font-mono text-xs text-secondary">
                  {date}
                </time>
              ) : (
                <span
                  className="font-sans font-medium text-xs text-secondary items-baseline"
                  title="Development release date"
                >
                  {date}
                  <span className="sr-only"> (preview only)</span>
                </span>
              )}
              <span
                aria-hidden="true"
                className="absolute top-8 left-[11.5px] hidden h-screen w-px bg-line min-[900px]:block"
              />
            </div>
          )}
        </div>
      </aside>

      <div className="min-w-0">
        <header className="mb-5">
          <Heading
            level={titleLevel}
            id={`${release.version}-title`}
            className="text-display"
          >
            <Link href={`/releases/${release.version}`} className="hover:text-accent text-heading">
              {release.title}
            </Link>
          </Heading>
        </header>

        <MarkdownContent
          id={view === "page" ? "highlights" : `${release.version}-highlights`}
          className="release-copy text-copy"
          headingLevel={contentHeadingLevel}
          allowImages
        >
          {release.body}
        </MarkdownContent>

        {view === "feed" ? (
          <Link
            href={`/releases/${release.version}#changelog`}
            className="mt-6 inline-flex items-center gap-2 text-sm text-secondary hover:text-accent"
          >
            Full changelog
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        ) : (
          <section id="changelog" className="mt-10 scroll-mt-8 text-[15px]">
            <Separator className="mb-5 bg-line" />
            <MarkdownContent
              className="release-changelog"
              headingLevel={contentHeadingLevel}
            >
              {release.changelog}
            </MarkdownContent>
          </section>
        )}
      </div>
    </article>
  );
}
