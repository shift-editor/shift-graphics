import Link from "next/link";
import GithubIcon from "../assets/github.svg";
import Logo from "../assets/logo.svg";
import { getGitHubStarCount } from "../../lib/github";
import MobileNavMenu from "./MobileNavMenu";
import PrimaryNavigation from "./PrimaryNavigation";
const compactNumber = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export default async function SiteHeader() {
  const githubStarCount = await getGitHubStarCount();
  const starLabel =
    githubStarCount === null ? "GitHub" : compactNumber.format(githubStarCount).toLowerCase();

  return (
    <header className="font-ui">
      <nav
        aria-label="Main navigation"
        className="grid grid-cols-[1fr_auto] items-center gap-x-6 text-sm sm:grid-cols-[1fr_auto_1fr] [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-4 [&_a]:focus-visible:outline-accent"
      >
        <Link href="/" aria-label="Shift home" className="justify-self-start">
          <Logo className="block h-5 w-auto" aria-hidden />
        </Link>

        <PrimaryNavigation />

        <div className="col-start-2 flex items-center gap-3 justify-self-end sm:col-start-3">
          <a
            href="https://github.com/shift-editor/shift"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={
              githubStarCount === null
                ? "Shift on GitHub"
                : `Shift on GitHub, ${githubStarCount.toLocaleString("en")} stars`
            }
            className="inline-flex items-center gap-1.5 text-xs transition-opacity hover:opacity-60"
          >
            <GithubIcon aria-hidden="true" className="h-5 w-5" />
            <span>{starLabel}</span>
          </a>
          <div className="sm:hidden">
            <MobileNavMenu />
          </div>
        </div>
      </nav>
    </header>
  );
}
