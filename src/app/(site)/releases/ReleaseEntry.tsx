import { ArrowLeft, ArrowRight, ArrowUpRight, Download } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { downloadTargets } from "../../../lib/downloads";
import { getDisplayDate, type Release } from "../../../lib/releases";
import { Heading, nextHeadingLevel, type HeadingLevel } from "../../components/Heading";
import { MarkdownContent } from "../../components/MarkdownContent";
import { Separator } from "../../components/ui/Separator";


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

  const downloads = downloadTargets
    .map(({ platform, options }) => ({
      platform,
      links: options.flatMap(({ label, assetPattern }) => {
        const asset = release.assets.find(({ name }) => assetPattern.test(name));
        return asset ? [{ label, asset }] : [];
      }),
    }))
    .filter(({ links }) => links.length > 0);
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
              <Image
                src="/backwards-cap.svg"
                alt=""
                width={32}
                height={32}
                unoptimized
                aria-hidden="true"
                className="relative z-10 h-6 w-6 bg-app object-contain"
              />
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
          {release.prerelease && (
            <span className="mt-3 inline-block rounded border border-accent/20 px-2 py-0.5 text-xs text-accent">
              Prerelease
            </span>
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

        {release.assets.length > 0 && (
          <section
            id={view === "page" ? "downloads" : `${release.version}-downloads`}
            aria-label="Downloads"
            className="mt-10 scroll-mt-8 overflow-hidden rounded-lg border border-line bg-surface sm:mt-12"
          >
          <header className="flex items-start justify-between gap-4 px-5 py-5 sm:px-7 sm:py-6">
            <div className="min-w-0">
              <p className="mb-1 text-xs text-muted">Downloads</p>
              <Heading
                level={contentHeadingLevel}
                className="break-words text-xl font-medium tracking-tight"
              >
                Shift {release.version}
              </Heading>
              {date && release.date && (
                <time dateTime={release.date} className="mt-1 block text-xs text-muted">
                  {date}
                </time>
              )}
            </div>
            <Download aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-placeholder" />
          </header>

          {downloads.length > 0 && (
            <dl className="border-t border-line-subtle px-5 sm:px-7">
              {downloads.map(({ platform, links }) => (
                <div
                  key={platform}
                  className="grid grid-cols-[100px_minmax(0,1fr)] items-baseline gap-x-4 gap-y-2 border-b border-line-subtle py-4 text-sm last:border-b-0 sm:grid-cols-[140px_minmax(0,1fr)]"
                >
                  <dt className="text-secondary">{platform}</dt>
                  <dd className="flex flex-wrap gap-x-5 gap-y-2">
                    {links.map(({ label, asset }) => (
                      <a
                        key={asset.url}
                        href={asset.url}
                        aria-label={`Download Shift ${release.version} for ${platform}: ${label}`}
                        className="whitespace-nowrap text-accent hover:opacity-70"
                      >
                        {label}
                      </a>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          <footer className="space-y-3 border-t border-line-subtle px-5 py-4 text-xs leading-6 text-muted sm:px-7">
            <a
              href={release.source.url}
              className="inline-flex items-center gap-1.5 text-secondary hover:opacity-70"
            >
              All files
              <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
            </a>
            <p>
              Want the latest changes?{" "}
              <a
                href="https://github.com/shift-editor/shift/releases/tag/nightly"
                className="inline-flex items-center gap-1 text-accent hover:opacity-70"
              >
                Try Shift Nightly
                <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
              </a>
              , our rolling experimental build.
            </p>
          </footer>
          </section>
        )}

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
