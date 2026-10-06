import Image from "next/image";
import Link from "next/link";
import DownloadMenu from "../components/DownloadMenu";
import { downloadLinks } from "../../lib/downloads";
import { pageMetadata } from "../../lib/metadata";
import { getReleases } from "../../lib/releases";
import SoftwareJsonLd from "../components/SoftwareJsonLd";

export const metadata = pageMetadata({ path: "/" });

export default async function Home() {
  const [latest] = await getReleases();
  const links = downloadLinks(latest?.assets ?? null);

  return (
    <div className="flex flex-1 flex-col">
      <SoftwareJsonLd version={latest?.version} />
      <main className="flex flex-1 flex-col items-center justify-center gap-10 lg:mt-18">
        <header className="mt-8 px-2 text-center sm:m-0">
          <h1 className="font-sans text-3xl leading-none font-bold tracking-tight text-balance sm:mt-12 sm:tracking-tighter sm:text-[8vw] lg:mt-0 lg:text-display">
            A <span className="italic">free</span> and{" "}
            <span className="whitespace-nowrap">open-source</span> font editor
          </h1>
          <div className="mt-4 flex w-full items-center justify-center text-center">
            <p className="max-w-[60ch] font-ui text-sm text-balance lg:text-base">
              Design variable fonts on macOS, Windows, and Linux.
            </p>
          </div>
        </header>

        <div className="px-2 sm:mt-4 flex flex-col items-center justify-start gap-2.5">
          <DownloadMenu links={links} />
          <p className="w-full text-xs font-sans text-muted text-center">
            {latest ? (
              <Link href={`/releases/${latest.version}`} className="hover:text-accent">
                Currently in alpha v{latest.version}
              </Link>
            ) : (
              <>
                Currently in alpha ·{" "}
                <Link href="/downloads/nightly" className="hover:text-accent">
                  Nightly build
                </Link>
              </>
            )}
          </p>
        </div>

        <Image
          src="/hero.png"
          alt="Shift font editor"
          width={2400}
          height={1600}
          className="-mx-6 h-auto w-[calc(100%+3rem)] max-w-none sm:mx-auto sm:w-full sm:max-w-[1200px]"
          sizes="(min-width: 1296px) 1200px, (min-width: 640px) calc(100vw - 6rem), 100vw"
          priority
        />

      </main>
    </div>
  );
}
