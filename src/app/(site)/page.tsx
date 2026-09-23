import Image from "next/image";
import DownloadMenu from "../components/DownloadMenu";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
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
          <DownloadMenu />
          <p className="w-full text-xs font-sans text-muted text-center">Currently in alpha v0.1.1</p>
        </div>

        <Image
          src="/hero.png"
          alt="Shift font editor"
          width={2400}
          height={1600}
          className="-mx-6 h-auto w-[calc(100%+3rem)] max-w-none sm:mx-auto sm:w-full sm:max-w-[1200px]"
          unoptimized
          priority
        />

      </main>
    </div>
  );
}
