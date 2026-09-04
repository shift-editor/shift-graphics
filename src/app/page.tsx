import Image from "next/image";
import Link from "next/link";
import Logo from "./assets/logo.svg";
import GithubIcon from "./assets/github.svg";
import DiscordIcon from "./assets/discord.svg";
import XIcon from "./assets/x.svg";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between px-6 sm:px-12 lg:px-24 py-8 bg-[#e9e9e9]">
      <nav className="flex justify-between items-center font-mono text-xs tracking-widest uppercase">
        <div>
          <Link href="/">
            <Logo className="block h-5 w-auto" aria-hidden />
          </Link>
        </div>

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

      <main className="flex-1 flex flex-col gap-4 justify-center items-center mt-18">
        <div className="max-w-2xl px-2 mt-8 sm:m-0">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-sans tracking-tighter text-center">A free, open source <span className="text-[royalblue]">font editor</span></h1>
          <div className="flex flex-col font-inter text-sm mt-6 max-w-[60ch]">
            <p className="font-inter">Shift is a fast font editor built from scratch with TypeScript and Rust. Open source, cross-platform, and easy to use.</p>
          </div>
        </div>

        <div className="max-w-2xl px-2 flex justify-center items-center">
          <div className="flex flex-wrap sm:flex-row items-center justify-center gap-3 sm:mt-4">
            <a
              href="#waitlist"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[royalblue] text-white text-xs font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              Join the waitlist
            </a>
            <Link
              href="https://github.com/shift-editor/shift"
              target="_blank"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-neutral-300 text-xs font-medium rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <GithubIcon className="h-4 w-auto" aria-hidden />
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

        <div className="w-full max-w-4xl mx-auto">
          <Image
            src="/hero.png"
            alt="Shift font editor"
            width={1200}
            height={800}
            className="w-full h-auto"
            unoptimized
            priority
          />
        </div>


        <div className="w-full max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 sm:mt-10 px-2 mb-14">
          <div>
            <h2 className="font-sans font-semibold text-sm tracking-tight mb-2">TypeScript & Canvas</h2>
            <p className="font-inter text-sm text-neutral-600 leading-relaxed">Built with TypeScript, React, and fast Canvas 2D rendering. Shift runs on Electron, giving you a native desktop app with the flexibility of the web platform.</p>
          </div>
          <div>
            <h2 className="font-sans font-semibold text-sm tracking-tight mb-2">Rust font tooling</h2>
            <p className="font-inter text-sm text-neutral-600 leading-relaxed">Integrating with the <a href="https://github.com/googlefonts/oxidize" target="_blank" className="text-[royalblue] hover:underline">growing Rust font tooling ecosystem</a>, Shift aims to be a development target for new Rust based font tools and technologies.</p>
          </div>
        </div>

        <section id="waitlist" className="w-full max-w-xl mx-auto px-2 mb-18">
          <h2 className="font-sans font-semibold text-sm tracking-tight mb-4 text-center">Join the waitlist</h2>
          <form
            action="https://formspree.io/f/mgolyjpn"
            method="POST"
            className="flex flex-col sm:flex-row gap-2"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="you@example.com"
              className="flex-1 bg-white px-4 py-2.5 border border-neutral-300 rounded-lg text-sm font-inter placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[royalblue] focus:border-transparent"
              aria-label="Email address"
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-[royalblue] text-white text-xs font-medium rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Join
            </button>
          </form>
        </section>

      </main>

      <footer className="flex flex-col items-center">
        <div className="w-full">
          <div className="w-full flex flex-col-reverse sm:flex-row justify-between items-start gap-3 sm:gap-0 font-mono font-thin text-[0.6rem]">
            <div className="flex flex-col gap-1">
              <p className="font-mono font-normal uppercase"> <span className="font-sans">©</span> designed and engineered by kostya farber.</p>
              <p><span className="font-sans font-medium">{`${new Date().getFullYear()}`}</span></p>
            </div>
            <div>
              <p className="flex items-center gap-2 font-mono text-xs uppercase sm:mt-2"><span className="inline-block h-2 w-2 shrink-0 rounded-full bg-[royalblue]" />Currently in alpha — under active development</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
