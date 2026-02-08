import Link from "next/link";
import Logo from "./assets/logo.svg";
import { ImageCarousel } from "./components/ImageCarousel";
import GithubIcon from "./assets/github.svg";
import DiscordIcon from "./assets/discord.svg";
import XIcon from "./assets/x.svg";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between px-6 sm:px-12 lg:px-24 py-8">
      <nav className="flex justify-between items-center font-mono text-xs tracking-widest uppercase">
        <Link href="/">
          <Logo className="block h-7 w-auto" aria-hidden />
        </Link>

        <div className="flex items-center gap-4">
          <Link href="https://github.com/shift-editor/shift" target="_blank">
            <GithubIcon className="block h-5 w-auto text-black" aria-hidden />
          </Link>
          <Link href="https://discord.gg/582FxBdNH7" target="_blank">
            <DiscordIcon className="block h-5 w-auto" aria-hidden />
          </Link>
          <Link href="https://x.com/kostyafarber_" target="_blank">
            <XIcon className="block h-5 w-auto" aria-hidden />
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col gap-4 justify-center items-center">
        <div className="max-w-2xl px-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-sans tracking-tighter text-center">A free, open source <span className="text-[blue]">font editor</span></h1>
          <div className="flex flex-col font-inter text-sm mt-6 max-w-[60ch]">
            <p><span className="font-semibold font-inter">Built from scratch with TypeScript and Rust.</span> Shift is cross platform, and aims to be fast, and simple to use.</p>
          </div>
        </div>

        <div className="max-w-2xl px-2">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <Link
              href="https://github.com/shift-editor/shift"
              target="_blank"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white text-xs font-medium rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <GithubIcon className="h-4 w-auto text-white" aria-hidden />
              Star on GitHub
            </Link>
            <Link
              href="https://discord.gg/582FxBdNH7"
              target="_blank"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-neutral-300 text-xs font-medium rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <DiscordIcon className="h-4 w-auto" aria-hidden />
              Join the Discord
            </Link>
          </div>
        </div>

        <ImageCarousel />
        <div className="w-full max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 mt-10 px-2 mb-20">
          <div>
            <h2 className="font-sans font-semibold text-sm tracking-tight mb-2">TypeScript & Canvas</h2>
            <p className="font-inter text-sm text-neutral-600 leading-relaxed">Built with TypeScript, React, and fast Canvas 2D rendering. Shift runs on Electron, giving you a native desktop app with the flexibility of the web platform.</p>
          </div>
          <div>
            <h2 className="font-sans font-semibold text-sm tracking-tight mb-2">Rust font tooling</h2>
            <p className="font-inter text-sm text-neutral-600 leading-relaxed">Integrating with the <a href="https://github.com/googlefonts/oxidize" target="_blank" className="text-[blue] hover:underline">growing Rust font tooling ecosystem</a>, Shift aims to be a development target for new Rust based font tools and technologies.</p>
          </div>
        </div>

      </main>

      <footer className="flex flex-col items-center">
        <div className="w-full">
          <div className="w-full flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0 font-mono font-thin text-[0.6rem]">
            <div className="flex flex-col gap-1">
              <p className="font-mono font-normal uppercase"> <span className="font-sans">©</span> designed and engineered by kostya farber.</p>
              <p><span className="font-sans font-medium">{`${new Date().getFullYear()}`}</span></p>
            </div>
            <div>
              <p className="flex items-center gap-2 font-mono text-xs uppercase sm:mt-2"><span className="inline-block h-2 w-2 shrink-0 rounded-full bg-[blue]" />Currently in alpha — under active development</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
